var cy;
var cy_nav;

function selectApp(e) {
	var selectedData = JSON.parse(e.target.getAttribute("data"));
	$("#select-app-path").val(selectedData.path);
	$("#select-app-type").val(selectedData.type);
	$("#select-app-data").val(selectedData.data);
	$("#select-app-validate").click();
}

function saveModelData(e) {
	/*modelData.path = $("#select-app-path").val().replace("#flow", "flow"); 
	modelData.data = $("#select-app-data").val();
	modelData.type = $("#select-app-type").val();*/
}

var originalModel = {};

var modelData = {};
// called when selecting an app, queries server for model
function getModel(reset=false) {
    if (reset) {
        // asked to reset, overwrite env model
        modelData.envModel = {
            "physical_processes": [],
            "links": []
        };
    } 

	if (modelData.path === "" || modelData.type === "") return "invalid";
	initCytoscape();
	$.ajax("/acm-renderer/model", { method: "POST", data: JSON.stringify(modelData), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
        .done(function (data) {
            if (data.error) {
                window.ACMCallbacks.showErrorNotification(data);
            } else {
                modelData.model = data.model;
                originalModel = data.model;
                cy.json(data.graph);
                cy.fit();
            }
		}).fail(function (data) {
			console.log("ERROR:: " + JSON.stringify(data));
		});
}

// called when selecting an app, queries server for model, from a file/json
function getModelFromJSON(json, reset = false) {
    if (reset) {
        // asked to reset, overwrite env model
        modelData.envModel = {
            "physical_processes": [],
            "links": []
        };
    }

    if (modelData.path === "" || modelData.type === "") return "invalid";
    initCytoscape();
    $.ajax("/acm-model-editor/loadFile", { method: "POST", data: JSON.stringify({ ...modelData, json: json }), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
        .done(function (data) {
            modelData.model = data.model;
            originalModel = data.model;
            cy.json(data.graph);
            cy.fit();
        }).fail(function (data) {
            console.log("ERROR:: " + JSON.stringify(data));
        });
}

// we need that function to update env model without regenerating the rest of the model
function updateEnvModel(envModel) {
    // store/process env model
    if (envModel) {
        // load env model case: just use the provided model
        try {
            modelData.envModel = JSON.parse(envModel);
        } catch (e) {
            modelData.envModel = {};
        }
        // reset to cached original model
        modelData.model = JSON.parse(JSON.stringify(originalModel));
    } else {
        processEnvModel();
    }

    // refresh env model on server
    $.ajax("/acm-renderer/updateEnvModel", { method: "POST", data: JSON.stringify(modelData), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
        .done(function (data) {
            initCytoscape();
            modelData.model = data.model;
            cy.json(data.graph);
            window.ACMCallbacks.focus();
        }).fail(function (data) {
            console.log("ERROR:: " + data);
        });
}

function getModelRefresh() {
    processEnvModel();
	initCytoscape();
	$.ajax("/acm-renderer/modelRender", { method: "POST", data: JSON.stringify(modelData.model), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
		.done(function (data) {
            cy.json(data.graph);
            window.ACMCallbacks.focus();
		}).fail(function (data) {
			console.log("ERROR:: " + data);
		});
}

function renderModel(model) {
    processEnvModel();
	initCytoscape();
	$.ajax("/acm-renderer/modelRender", { method: "POST", data: JSON.stringify(model), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
		.done(function (data) {
            cy.json(data.graph);
            window.ACMCallbacks.focus();
		}).fail(function (data) {
			console.log("ERROR:: " + data);
		});
}

// remove detected acms
function clearACMs() {
    modelData.model = JSON.parse(JSON.stringify(originalModel));
    updateEnvModel(JSON.stringify(modelData.envModel));
}

// called when clicking on a conflict to solve
function selectConflict(event) {
    // don't do nothing on parent nodes
    if (event.target.data("isParent")) { return; }

    // ACMs and monitors
    if (window.ACMCallbacks.state.currentStep === 3 && (event.target.data("isACM") || event.target.data("isMonitor"))) {
		var conflictData = { id: event.target.id(), model: modelData };
		$.ajax("/acm-renderer/select", { method: "POST", data: JSON.stringify(conflictData), dataType: "json", processData: false, contentType: "application/json; charset=utf-8" })
			.done(function (data) {
				if (event.target.data("isMonitor")) {
					window.ACMCallbacks.openMonitorModal(data, conflictData);
				} else {
					window.ACMCallbacks.openStratModal(data, conflictData);
				}
			}).fail(function (data) {
				console.log("ERROR:: " + JSON.stringify(data));
			});
    } else if (window.ACMCallbacks.state.currentStep === 1) {
		// general case, bring up the phyproc modal
        let id = event.target.id();
        let node = modelData.model.components.find(cmp => cmp.id === id);
        if (node) {
            window.ACMCallbacks.openSelPhyModal(node);
        }
	}
}

// for now we send the env model as a string in envModel, to be merged
// need to process that model from wimac to string
function processEnvModel() {
    if (modelData.model) {
        let envModelProcess = { physical_processes: modelData.model.physicalProcess || [], links: [] };
        for (var cmpidx in modelData.model.components) {
            for (var ppidx in modelData.model.components[cmpidx].physicalProcess) {
                envModelProcess.links.push({
                    from_id: modelData.model.components[cmpidx].id,
                    to_id: modelData.model.components[cmpidx].physicalProcess[ppidx].id
                });
            }
        }
        console.log(JSON.stringify(envModelProcess));
        modelData.envModel = envModelProcess;
    } else {
        modelData.envModel = { physical_processes: [], links: [] };
    }
}

// node dragged try to save its new pos to model
function nodeDragged(event) {
	console.log(event.target.id());
	//console.log(event.target.position());
	//console.log(event.target.classes());

	let targetID = event.target.id();
	let targetPos = event.target.position();

	// phyprox are not in components 
	if (event.target.classes().indexOf("physicalProcess") === -1) {
		for (let cmpidx in modelData.model.components) {
			let cmp = modelData.model.components[cmpidx];
			if (cmp.id_parent === targetID || cmp.id === targetID) {
				console.log("moving " + cmp.id);
				let cynode = cy.getElementById(cmp.id);
				cmp.x = cynode.position().x;
				cmp.y = cynode.position().y;
			}
		}
	} else {
		let envModel = modelData.model.physicalProcess;
		for (let phyprocidx in envModel) {
			let phyproc = envModel[phyprocidx];
			if (phyproc.id === targetID) {
				phyproc.x = targetPos.x;
				phyproc.y = targetPos.y;
			}
		}
		modelData.model.physicalProcess = envModel;
		console.log(envModel);
	}

	if (event.target.classes().indexOf("parent-node") === -1
		|| event.target.classes().indexOf("conflict-parent-node") === -1) {
		// not a parent node 
	} else {
		// parent node
		// move all children

	}
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

var baseACMCytoscapeStyle = [
    {
        selector: 'node',
        css: {
            'content': 'data(name)',
            'background-fit': 'contain',
            'background-image-opacity': '0.9',
            'background-repeat': 'no-repeat',
            'background-clip': 'none',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '8px',
            'font-weight': 'normal',
            'min-zoomed-font-size': '10px',
            'height': '16px',
            'width': '64px',
            'shape': 'rectangle'
        }
    },
    {
        selector: 'edge',
        css: {
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle'
        }
    },
    {
        selector: ':selected',
        css: {
            'background-color': 'black',
            'line-color': 'black',
            'target-arrow-color': 'black',
            'source-arrow-color': 'black'
        }
    },
    {
        selector: 'node.SoftwareComponent',
        css: {
            'background-image': './img/softwarecomponent.png'
        }
    },
    {
        selector: 'node.ACMComponent',
        css: {
            'background-image': './img/acm.png',
            'height': '48px',
            'width': '48px',
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    },
    {
        selector: 'node.ACMComponent-configured',
        css: {
            'background-image': './img/acm-configured.png',
            'height': '48px',
            'width': '48px',
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    },
    {
        selector: 'node.Monitor',
        css: {
            'background-image': './img/monitor.png',
            'height': '48px',
            'width': '48px',
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    },
    {
        selector: 'node.Monitor-configured',
        css: {
            'background-image': './img/monitor-configured.png',
            'height': '48px',
            'width': '48px',
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    },
    {
        selector: 'node.Action',
        css: {
            'background-image': './img/action.png'
        }
    },
    {
        selector: 'node.CommunicationComponent',
        css: {
            'background-image': './img/mqtt.png'
        }
    },
    {
        selector: 'node.physicalProcess',
        css: {
            'background-image': './img/physicalProcess.png',
            'height': '32px',
            'width': '32px',
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    }, {
        selector: 'node.parent-node',
        css: {
            'text-valign': 'top',
            'font-weight': 'normal'
        }
    },
    {
        selector: 'node.conflict-parent-node',
        css: {
            'text-valign': 'top',
            'font-weight': 'normal',
        }
    }
];

var virtualLinkVisibleStyle = {
    selector: 'edge.virtual',
    css: {
        'curve-style': 'straight',
        'target-arrow-shape': 'triangle',
    }
};

var virtualLinkHiddenStyle = {
    selector: 'edge.virtual',
    css: {
        'curve-style': 'haystack',
        'display': 'none'
    }
};

function initCytoscape() {
    //cleanup first
    if (cy) cy.destroy();
    if (cy_nav) cy_nav.destroy();

    cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,

        style: [...baseACMCytoscapeStyle, virtualLinkVisibleStyle],

		elements: {
			nodes: [],
			edges: []
		},

		layout: {
			name: 'preset'
		}

	});
	cy.on("tap", "node", selectConflict);
    cy.on("dragfreeon", "node", nodeDragged);
    cy.on("viewport", onViewport);
    console.log("Cytoscape init OK");

    cy_nav = cy.navigator({
        container: "#cy_nav",
        removeCustomContainer: false
    });
    console.log("Cytoscape Navigator init OK");
}

function onViewport(e) {
    let zoomFactor = cy.zoom();
    let defaultZoom = 2;
    document.getElementById("cy").style.backgroundSize = defaultZoom * zoomFactor + "vh " + defaultZoom * zoomFactor + "vh";

    let panPos = cy.pan();
    document.getElementById("cy").style.backgroundPosition = panPos.x + "px " + panPos.y + "px";
}

function showVirtualLinks() {
    cy.style([...baseACMCytoscapeStyle, virtualLinkVisibleStyle]);
}

function hideVirtualLinks() {
    cy.style([...baseACMCytoscapeStyle, virtualLinkHiddenStyle]);
}

var virtualLinksVisible = true;
function toggleVirtualLinks() {
    (virtualLinksVisible ? hideVirtualLinks : showVirtualLinks)();
    virtualLinksVisible = !virtualLinksVisible;
}

// util functions
function generateNRID() {
	return "PP_" + generateID(8) + "." + generateID(6);
}

// generate hex id https://stackoverflow.com/a/27747377
// dec2hex :: Integer -> String
function dec2hex(dec) {
	return ('0' + dec.toString(16)).substr(-2);
}

// generateId :: Integer -> String
function generateID(len) {
	var arr = Array.from({ length: len/2 }, () => Math.floor(Math.random() * 255));
	return Array.from(arr, dec2hex).join('');
}