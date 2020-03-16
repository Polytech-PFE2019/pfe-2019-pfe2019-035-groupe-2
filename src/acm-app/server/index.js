var acm_detection = require("acm-detection");
var acm_repo = require("acm-repository-gateway");
var acm_model_merger = require("acm-model-merger");
var acm_model_converter = require("./acm-model-converter-proxy");
var acm_deployment = require("acm-deployment");
var acm_injection = require("acm-injection");
var acm_metamodel = require("acm-metamodel");
const crypto = require('crypto');
const http = require("http");
const URL = require('url').URL;
const util = require('util');
const fs = require('fs');
const { spawn } = require('child_process'); 

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

var Monitor = acm_metamodel.Monitor;
var ACMComponent = acm_metamodel.ACMComponent;
var Action = acm_metamodel.Action;
var SoftwareComponent = acm_metamodel.SoftwareComponent;
var Link = acm_metamodel.Link;
var PhysicalProcess = acm_metamodel.PhysicalProcess;

var express = require("express");
var app = express();
app.set("port", 8008);
// enable json body
app.use(express.json({ limit: '10mb' }));
// enable swagger doc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// start server
var server = app.listen(app.get('port'), '0.0.0.0', function () {
	var port = server.address().port;
	console.log('ACM Server started on ' + port);
});

// Route to get the model, parameters are a JSON object with path and type
app.post("/acm-renderer/model", generateModel);
// Load from file
app.post("/acm-model-editor/loadFile", loadFile);
// Solve conflicts with default ACM
app.post("/acm-model-editor/solveConflictsDefault", solveConflictsDefault);
// Route to find conflicts, parameters are a metamodel json serialization
app.post("/acm-renderer/findConflicts", findConflicts);
// Route to select a conflict to solve
app.post("/acm-renderer/select", selectConflict);
// Route to get the list of supported application types
app.get("/acm-renderer/supported-app-types", getSupportedAppTypes);
// Route to instantiate an ACM
app.post("/acm-renderer/instantiateACM", instantiateACM);
// Route to instantiate a Monitor
app.post("/acm-renderer/instantiateMonitor", instantiateMonitor);
// Route to deploy a model, online, to the target
app.post("/acm-renderer/deployOnline", deployOnline);
// Route to deploy a model, as a file to be downloaded
app.post("/acm-renderer/deployDownload", deployDownload);
// Render model for view refresh without full reploy
app.post("/acm-renderer/modelRender", onDemandRender);
// Refresh env model without refreshing the rest of the model
app.post("/acm-renderer/updateEnvModel", updateEnvModel);

// Route to add a new strategy to the database
app.post("/acm-database/addStrategy", addStrategyToDatabase);
// Route to list all strats in database (debug)
app.get("/acm-database/strategyDatabaseListing", strategyDatabaseListing);
// Route to query strategy database using sparql for jena or metadata for both
app.post("/acm-database/queryStrategyDatabase", queryStrategyDatabase);
// Check if database is online and started properly
app.get("/acm-database/queryDatabaseStatus", queryDatabaseStatus);

// Starts AGG with ACM rules for edition
app.post("/acm-model-editor/editAGGRules", editAGGRules);

function loadFile(req, res) {
    try {
        switch (req.body.type) {
            case "node-red":
                acm_model_converter.nodeRedConverter.fromJSON(
                    JSON.parse(req.body.json),
                    (model) => generateModelCallback(model, req.body.envModel, res)
                );
                break;
            case "genesis":
                // not a file, pretend it's a url and try it
                acm_model_converter.genesisConverter.fromJSON(
                    JSON.parse(req.body.json),
                    (model) => generateModelCallback(model, req.body.envModel, res)
                );
                break;
            default:
                res.type("application/json");
                res.end(JSON.stringify({ error: "Invalid model type", c:"Load from file" }));
                return;
        }
    } catch (e) {
        console.error(e);
        res.type("application/json");
        res.end(JSON.stringify({ error: e }));
    }
}

function getSupportedAppTypes(req, res) {
    res.end(JSON.stringify([{ text: "Node-RED", value: "node-red", defaultPath: "http://localhost:1880/" }, { text: "GeneSIS", value: "genesis", defaultPath: "http://localhost:8880/" }]));
}

// we have to be server side node to use child_process
// i definitely hate the agg editor
function editAGGRules(req, res) {
    let command = process.platform === "win32" ? "agg.bat" : "agg.sh";
    let spawnret = spawn(command, [".\\ACMRuleTemplate.ggx"]);
    if (spawnret.pid) {
        res.end(JSON.stringify({
            type: 'info',
            message: 'AGG Editor starting...',
            description:
                'The AGG editor will show up shortly, edit rules then overwrite the file to update ACM rules',
            duration: 10
        }));
    } else {
        res.end(JSON.stringify({
            type: 'error',
            message: 'AGG Editor unavailable!',
            description:
                "ACM couldn't start AGG Editor, make sure " + command + " is in the PATH",
            duration: 0
        }));
    }
}

function updateEnvModel(req, res) {
    let models = rebuildMetamodel(req.body.model);
    let envModel = req.body.envModel;
    acm_model_merger.unmergeModels(models, (unmergedModel) => {
        acm_model_merger.mergeModels(unmergedModel, envModel,
            (mergedModel) => {
                res.type("application/json");
                res.end(JSON.stringify(render(mergedModel)));
            }
        )
    });
}

function generateModel(req, res) {
	switch (req.body.type) {
	case "node-red":
		acm_model_converter.nodeRedConverter.fromURL(
			req.body.path,
			(model) => generateModelCallback(model, req.body.envModel, res)
		);
		break;
	case "genesis":
		if (fs.existsSync("genesis_models/" + req.body.path)) {
			// file exists, load it
			let genesismodel = fs.readFileSync("genesis_models/" + req.body.path);
			acm_model_converter.genesisConverter.fromJSON(
				JSON.parse(genesismodel),
				(model) => generateModelCallback(model, req.body.envModel, res)
			);
		} else {
			// not a file, pretend it's a url and try it
			acm_model_converter.genesisConverter.fromURL(
				req.body.path,
				(model) => generateModelCallback(model, req.body.envModel, res)
			);
		}
		break;
	default:
            res.type("application/json");
            res.end(JSON.stringify({ error: "Invalid model type", operation: "Load from server" }));
		return;
	}
}

function generateModelCallback(models, envModel, res) {
	acm_model_merger.mergeModels(rebuildMetamodel(models), envModel,
		(mergedModel) => {
			res.type("application/json");
			res.end(JSON.stringify(render(mergedModel, true)));
		}
	);
}

function findConflicts(req, res) {
    acm_model_merger.mergeModels(rebuildMetamodel(req.body.model), req.body.envModel,
        (mergedModel) => {
            //fs.writeFileSync("bite.json", JSON.stringify(mergedModel));
            acm_detection.detection.findActuationConflictsInModel(
                mergedModel,
                (modelConflicts) => {
                    //modelConflicts.url = req.body.path;
                    //finalLog(modelConflicts);
                    res.type("application/json");
                    res.end(JSON.stringify(modelConflicts));
                }
            );
        }
	);
}

function selectConflict(req, res) {
	//console.log(req.body.id);
	//console.log(JSON.stringify(req.body.model));
	res.type("application/json");
	acm_repo.getPolicies(ret => res.end(JSON.stringify(ret)));
}

function deployOnline(req, res) {
    console.log("deployOnline");
    try {
        acm_injection.injectNodes(rebuildMetamodel(req.body.model), (ret) => {
            //fs.writeFileSync("model.json", JSON.stringify(ret));
            acm_deployment.deployOnline(ret, (retdep) => {
                //finalLog(retdep);
                delete retdep.acm_model_type;
                res.type("application/json");
                res.end(JSON.stringify(retdep));
            });
        });
    } catch (e) {
        console.error(e);
        res.end(JSON.stringify({
            error: "Error deploying model",
            message: e.message
        }));
    }
}


function deployDownload(req, res) {
	console.log("deployDownload");
	acm_injection.injectNodes(rebuildMetamodel(req.body.model), (ret) => {
		acm_deployment.deployDownload(ret, (retdep) => {
			console.log("deployDownload ret");
			//finalLog(retdep);
			delete retdep.acm_model_type;
			res.type("application/json");
			res.end(JSON.stringify(retdep));
		});
	});
}


/**
 * 	console.log("Deploy command received for type " + req.body.conflict.model.model.type);
	var strat_id = req.body.strat_id;
	var conflict_id = req.body.conflict.id;
	acm_repo.getPolicies(strats => {
		// get strat
		strats = JSON.parse(strats);
		var selectedStrat = { id: "invalid" };
		for (var i = 0; i < strats.length; i++) {
			if (strats[i].id === strat_id) {
				selectedStrat = strats[i];
				break;
			}
		}
		if (selectedStrat.id === "invalid") {
			res.end("{\"error\":\"invalid strat id can't deploy\""); 
			return;
		}
	});
 * */

function solveConflictsDefault(req, res) {
    let model = rebuildMetamodel(req.body);
    let stratID = "Broadcast";
    let cmps = model.components.filter(cmp => cmp instanceof ACMComponent);
    let toprocess = cmps.length;

    // nothing to process just
    if (toprocess === 0) {
        res.end(JSON.stringify(render(model)));
    } else {
        console.log("solveConflictsDefault toprocess: " + toprocess)
        cmps.forEach(cmp => {
            instantiateACMImpl(cmp.id, stratID, model, (modelRet) => {
                toprocess--;
                //model = modelRet;

                if (toprocess === 0) {
                    //res.end(JSON.stringify(model.components.filter(cmp => cmp instanceof ACMComponent)));
                    res.end(JSON.stringify(model));
                }
            });
        });
    }
}

function instantiateACMImpl(targetComponentID, stratID, model, callback) {
    acm_repo.getPolicies(strats => {
        strats = JSON.parse(strats);
        var selectedStrat = { id: "invalid" };
        for (var i = 0; i < strats.length; i++) {
            if (strats[i].id === stratID || strats[i].name === stratID) {
                selectedStrat = strats[i];
                break;
            }
        }
        // yeah fuck it
        //console.log(stratID);
        if (selectedStrat.id === "invalid" && stratID !== "monitor") {
            res.end("{\"error\":\"invalid strat id can't deploy\"}");
            return;
        }

        var id_conflict = undefined;
        for (var cmpidx in model.components) {
            // because yes of course generated IDs are fucking ints not node-red ids like the rest of the fucking model because fuck consistency
            if ("" + model.components[cmpidx].id === targetComponentID) {
                model.components[cmpidx].strategy = selectedStrat;
                model.components[cmpidx].configured = true;
                id_conflict = model.components[cmpidx].id_conflict;
                break;
            }
        }

        // send help
        if (id_conflict) {
            for (var cmpidx2 in model.components) {
                //console.log(model.components[cmpidx2].id_conflict);
                if (model.components[cmpidx2].id_conflict === id_conflict) {
                    model.components[cmpidx2].strategy = selectedStrat;
                    model.components[cmpidx2].configured = true;
                }
            }
        }

        callback(model);
    });
}

function instantiateACM(req, res) {
    let targetComponentID = req.body.conflict.id;
	let stratID = req.body.strat_id;
    let model = rebuildMetamodel(req.body.conflict.model);

	//finalLog(req.body.conflict.model);

    instantiateACMImpl(targetComponentID, stratID, model, (modelRet) => {
        res.end(JSON.stringify({ success: modelRet }));
    });
}

// monitors
function instantiateMonitor(req, res) {
	var targetComponentID = req.body.conflict.id;
	var model = rebuildMetamodel(req.body.model);
    var monitorAction = req.body.monitorConfig;

	//finalLog(model);

	for (var cmpidx in model.components) {
		// because yes of course generated IDs are fucking ints not node-red ids like the rest of the fucking model because fuck consistency
		if ("" + model.components[cmpidx].id === targetComponentID) {
			model.components[cmpidx].action = monitorAction;
			model.components[cmpidx].configured = true;
			break;
		}
	}

	res.end(JSON.stringify({ success: model }));
}


// model is sent from client using json
// json loses type information
// needs to rebuild the model from json to metamodel type
function rebuildMetamodel(model) {
    return acm_metamodel.rebuildMetamodel(model);
}


function onDemandRender(req, res) {
	res.type("application/json");
	res.end(JSON.stringify(render(rebuildMetamodel(req.body))));
}

function render(model, initial=false) {
	// init rendered model
	var renderedModel = {};
    renderedModel.model = model;
    /*
	console.log("!! entering render, printing model");
	finalLog(model);
    console.log("----");
    */
    //fs.writeFileSync("model.json", JSON.stringify(model));
    
	// init graph section 
	renderedModel.graph = {
		zoomingEnabled: true,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		boxSelectionEnable: false,
		renderer: { name: "canvas" }
	};
	renderedModel.graph.elements = {
		nodes: [],
		edges: []
	};

	// insert parents
	var parentsToCreate = [];
	for (let cmpidx in model.components) {
		let componentz = model.components[cmpidx];
		// skipping comps with no parents
		if (componentz.id_parent && componentz.id_conflict !== "") {
            if (parentsToCreate.findIndex(cmp => cmp.id === componentz.id_parent) === -1) {
                // we need to create a new parent flow, go fetch its parent genesis container name and the flow name if available
                let parent_name = componentz.id_parent;
                if (model.models.dm) {
                    for (let gencmpidx in model.models.dm.components) {
                        let cmp = model.models.dm.components[gencmpidx];
                        // node red component, it has an nr_flow
                        if (cmp.nr_flow) {
                            for (let nodeidx in cmp.nr_flow) {
                                let node = cmp.nr_flow[nodeidx];
                                // ez case: we have a node with id === id_parent
                                if (node.id === componentz.id_parent) {
                                    // use name
                                    parent_name = cmp.name + "/" + node.label;
                                    break;
                                }
                                // bad case: no tab node
                                if (node.id === componentz.id) {
                                    parent_name = cmp.name + "/" + parent_name;
                                }
                            }
                        }
                    }
                }

                parentsToCreate.push({ id: componentz.id_parent, name: parent_name, isConflictParent: false });
			}
			if (componentz.id_conflict && parentsToCreate.findIndex(cmp => cmp.id === "conflict_" + componentz.id_conflict) === -1) {
                parentsToCreate.push({ id: "conflict_" + componentz.id_conflict, name: "conflict_" + componentz.id_conflict, isConflictParent: true });
			}
		}
	}
	for (var paridx in parentsToCreate) {
		var nodez = {
            data: { ...parentsToCreate[paridx], isParent: true },
			position: {
				x: 0, y: 0
			},
			group: "nodes",
			removed: false,
			selected: false,
			selectable: true,
			locked: false,
			grabbable: true,
			classes: parentsToCreate[paridx].id.startsWith("conflict_") ? "conflict-parent-node" : "parent-node"
		};
		renderedModel.graph.elements.nodes.push(nodez);
    }

    // run an ebin layout engine
    // we run the layout here to take advantage from having computed parent count
    if (initial) {
        runLayout(model, parentsToCreate);
    }

	// insert nodes
	for (var i = 0; i < model.components.length; i++) {
        var component = model.components[i];
        if (component.configuration && component.configuration.noRender) continue;
		if (component.id_parent !== "") {
			var node = {
				data: {
					id: component.id,
					name: component.name,
                    parent: component.id_conflict ? "conflict_" + component.id_conflict : component.id_parent,
                    actualParent: component.id_parent,
                    toConfigure: component instanceof ACMComponent && !component.configured,
                    isACM: component instanceof ACMComponent,
					isMonitor: component instanceof Monitor
				},
				position: {
					x: component.x, y: component.y
				},
				group: "nodes",
				removed: false,
				selected: false,
				selectable: true,
				locked: false,
				grabbable: true,
				classes: getClassForComponent(component)
			};
			renderedModel.graph.elements.nodes.push(node);

			// insert links to physical processes
            for (let phyproidx in component.physicalProcess) {
				let edge = {
					data: {
						id: component.id + "_" + component.physicalProcess[phyproidx].id,
						source: component.id,
						target: component.physicalProcess[phyproidx].id
					},
					position: {},
					group: "edges",
					removed: false,
					selected: false,
					selectable: false,
					locked: false,
					grabbable: true,
					classes: "phy"
				};
				renderedModel.graph.elements.edges.push(edge);
			}
		}
	}

	// insert edges/links
    for (i = 0; i < model.links.length; i++) {
        var link = model.links[i];
        // skip malformed links
        if (link.from.id && link.to.id) {
            let edge = {
                data: {
                    id: link.from.id + "_" + link.to.id,
                    source: link.from.id,
                    target: link.to.id
                },
                position: {},
                group: "edges",
                removed: false,
                selected: false,
                selectable: false,
                locked: false,
                grabbable: true,
                classes: link.virtual?"virtual":""
            };
            renderedModel.graph.elements.edges.push(edge);
        } else {
            console.log("malformed link");
            finalLog(link);
        }
	}

	// insert physical processes
    for (let phyprocidx in model.physicalProcess) {
        let phyProc = model.physicalProcess[phyprocidx];
		let node = {
			data: {
				id: phyProc.id,
				name: phyProc.name,
				parent: ""
			},
			position: {
				x: phyProc.x, y: phyProc.y
			},
			group: "nodes",
			removed: false,
			selected: false,
			selectable: true,
			locked: false,
			grabbable: true,
			classes: "physicalProcess"
		};
		renderedModel.graph.elements.nodes.push(node);
	}

	//finalLog(renderedModel.graph.elements.nodes);
	return renderedModel;
}

function getClassForComponent(component) {
	var compclass = component.constructor.name;
	if (compclass.startsWith("MQTT")) compclass = "mqtt";
	if (component.configured) {
		compclass += "-configured";
	}
	return compclass;
}


function runLayout(model, parents) {
    // sqrt(mbflow) wide, go up one y axis step every time you reach it
    let gridcols = Math.ceil(Math.sqrt(parents.length));
    //console.log("ACM layout " + gridcols);
    let xbase = 0, ybase = 0, xmax = 0, ymax = 0;
    for (let paridx in parents) {
        // find children
        for (let cmpidx in model.components) {
            let cmp = model.components[cmpidx];
            if (cmp.id_parent === parents[paridx].id) {
                cmp.x += xbase;
                cmp.y += ybase;

                if (cmp.x > xmax) { xmax = cmp.x; }
                if (cmp.y > ymax) { ymax = cmp.y; }
            }
        }

        if ((parseInt(paridx) + 1) % gridcols === 0) {
            //console.log("going to next row");
            // next row
            xbase = 0;
            xmax = 0;
            ybase = ymax + 30;
        } else {
            // next col
            xbase = xmax + 30;
        }
    }
}

function finalLog(o) {
	console.log(util.inspect(o, false, null, true));
}

/******
 * Rethink data explorer
 *	r.db('acm_repository').table('policies').forEach((entry)=>{
		return r.db('acm_repository').table('policies').get(entry('id')).delete();
	});
*/

function addStrategyToDatabase(req, res) {
	acm_repo.addPolicy(req.body, (dbres) => { console.log("addPolicy : " + dbres); res.end(dbres); });
}

function strategyDatabaseListing(req, res) {
    acm_repo.getPolicies((gpres) => { /*console.log(gpres);*/ res.type("application/json"); res.end(gpres); });
}

function queryStrategyDatabase(req, res) {
    acm_repo.queryPolicies(req.body, qpret => {
        res.type("application/json");
        res.end(qpret);
    });
}

function queryDatabaseStatus(req, res) {
    res.type('application/json');
    res.end(JSON.stringify(acm_repo.repoStatus));
}