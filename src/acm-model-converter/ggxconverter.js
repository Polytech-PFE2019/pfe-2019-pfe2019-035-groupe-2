var xml2js = require('xml2js');
var crypto = require("crypto");
var fs = require("fs");
var ACMMetamodel = require("acm-metamodel");

var util = require("util");

var exports = module.exports = {};
exports.fromMetamodel = function (metamodel, callback) {
	var templatexml = fs.readFileSync("ACMRuleTemplate.ggx");
	var parser = new xml2js.Parser();

	let PhysicalProcessesInGGX = {};

    parser.parseString(templatexml, function (err, template) {
        // parse types
        processGGXTypes(template.Document.GraphTransformationSystem[0].Types[0]);

		template.Document.GraphTransformationSystem[0].Graph[0].Node = [];
		template.Document.GraphTransformationSystem[0].Graph[0].Edge = [];
		// components
		for (var compidx in metamodel.components) {
			var component = metamodel.components[compidx];
			// can probably replace that by a JS object straight
			let newNode = {
				'$': { ID: component.id, name: component.id, type: getGGXTypeForMetamodelType(component) },
				NodeLayout: [{ '$': { X: Math.round(component.x) || 0, Y: Math.round(component.y) || 0 } }],
				additionalLayout:
					[{ '$': { age: '0', force: '10', frozen: 'true', zone: '50' } }]
			};
			template.Document.GraphTransformationSystem[0].Graph[0].Node.push(newNode);

			// add the physical process agg component
			for (let phyidx in component.physicalProcess) {
				let physicalProcess = component.physicalProcess[phyidx];

				// only add the phy proc if it's not instantiated already
				if (!PhysicalProcessesInGGX[physicalProcess.id]) {
					let newphy = {
						'$': { ID: physicalProcess.id, name: physicalProcess.id, type: getGGXTypeForMetamodelType(physicalProcess) }
                    };
					template.Document.GraphTransformationSystem[0].Graph[0].Node.push(newphy);
					PhysicalProcessesInGGX[physicalProcess.id] = 1;
				}

				let newLink = {
					'$': { ID: component.id + "_" + physicalProcess.id, type: ggxtypedic.Link, name: component.id + "_" + physicalProcess.id, source: component.id, target: physicalProcess.id }
				};
				template.Document.GraphTransformationSystem[0].Graph[0].Edge.push(newLink);
			}
		}

		// links
		for (var lnkidx in metamodel.links) {
            var link = metamodel.links[lnkidx];
            if (link.from && link.to) {
                var newLink = {
                    '$': { ID: link.id, type: ggxtypedic.Link, name: link.id, source: link.from.id, target: link.to.id },
                    EdgeLayout: [{ '$': { bendX: '0', bendY: '0', textOffsetX: '0', textOffsetY: '-22' } }],
                    additionalLayout:
                        [{ '$': { aktlength: '200', force: '10', preflength: '200' } }]
                };
                template.Document.GraphTransformationSystem[0].Graph[0].Edge.push(newLink);
            }
		}

		let builder = new xml2js.Builder();
		callback(builder.buildObject(template));
	});
};

exports.toMetamodel = function (ggx, metamodel, callback) {
	let ACMs = [];
	let idsggxtomm = {};
	let PhysicalProcesses = {};

	// hardcoded coordinates since agg api is determined to not add them for raisins
	let X = 0, Y = 0;

	var parser = new xml2js.Parser();
    parser.parseString(ggx, function (err, ggxmodel) {
        // parse types
        processGGXTypes(ggxmodel.Document.GraphTransformationSystem[0].Types[0]);

		// components
		for (let ggxcompidx in ggxmodel.Document.GraphTransformationSystem[0].Graph[0].Node) {
			var ggxcomp = ggxmodel.Document.GraphTransformationSystem[0].Graph[0].Node[ggxcompidx];
			//console.log(metamodel.components[mmcompidx].id + "===" + ggxcomp.$.name);
			// nodes created by agg have no name
			if (ggxcomp.$.name === undefined) {
				// node doesn't exist in metamodel, it is a new ACM or monitor, add it
				// they don't have parents because i can't figure out how to get that to work
				let id = generateNRID();
				if (ggxcomp.$.type === ggxtypedic.ACMComponent) {
					let acm = new ACMMetamodel.ACMComponent(id, "ACM " + ACMs.length, X, Y, ACMMetamodel.ACMType, "conflict_" + id, "classic", "the_best");
					Y = X += 100;
					// dont add to metamodel just now, wait until we know if it should be instantiated several times across flows
					//metamodel.components.push(acm);
					ACMs.push(acm);
                } else if (ggxcomp.$.type === ggxtypedic.Monitor) {
					let mon = new ACMMetamodel.Monitor(id, "Monitor " + ACMs.length, X, Y, ACMMetamodel.monitorType, "conflict_" + id, "classic", null, null);
					Y = X += 100;
					//metamodel.components.push(mon);
					ACMs.push(mon);
                } else if (ggxcomp.$.type === ggxtypedic.PhysicalProcess) {
					// remove the physical processes added to the agg graph for computation
					PhysicalProcesses[ggxcomp.$.ID] = 1;
					continue;
				} else {
					console.log("uh why the f is the comp type " + ggxcomp.$.type);
					continue;
				}
				console.log("adding " + ggxcomp.$.ID + "===" + id);
				idsggxtomm[ggxcomp.$.ID] = id;
			} else {
				// remove the physical processes added to the agg graph for computation
                if (ggxcomp.$.type === ggxtypedic.PhysicalProcess) {
					PhysicalProcesses[ggxcomp.$.ID] = 1;
				}
				// Add an association between ggx id and metamodel id
				idsggxtomm[ggxcomp.$.ID] = ggxcomp.$.name;
			}
		}

		// links
		let foundLinks = {};
		for (let ggxlnkidx in ggxmodel.Document.GraphTransformationSystem[0].Graph[0].Edge) {
			var ggxedge = ggxmodel.Document.GraphTransformationSystem[0].Graph[0].Edge[ggxlnkidx];
			// links created in agg have no name
			if (ggxedge.$.name === undefined) {
				// add a new link
				//id, name,x,y, from, to
				/*console.log(idsggxtomm[ggxedge.$.source]);
				console.log(idsggxtomm[ggxedge.$.target]);
				finalLog(metamodel.components);*/

				if (PhysicalProcesses[ggxedge.$.source] || PhysicalProcesses[ggxedge.$.target]) {
					continue;
				}

				// find components in either the metamodel, or the pending ACM lists
				let sourcecmp = metamodel.components.find(mmcmp => mmcmp.id === idsggxtomm[ggxedge.$.source]) || ACMs.find(mmcmp => mmcmp.id === idsggxtomm[ggxedge.$.source]);
				let destcmp = metamodel.components.find(mmcmp => mmcmp.id === idsggxtomm[ggxedge.$.target]) || ACMs.find(mmcmp => mmcmp.id === idsggxtomm[ggxedge.$.target]);

				let id = generateNRID();
				let link = new ACMMetamodel.Link(id, "Link" + id, 0, 0, sourcecmp, destcmp);
				metamodel.links.push(link);
				foundLinks[link.id] = ggxedge.$.ID;
			} else {
				// list all the already present links still present in agg output
				foundLinks[ggxedge.$.name] = ggxedge.$.ID;
			}
		}

		// delete all links not found in agg
		var newlnks = [];
		for (let lnkidx in metamodel.links) {
			if (foundLinks[metamodel.links[lnkidx].id]) {
				// link exists copy
				newlnks.push(metamodel.links[lnkidx]);
			} else {
				/*console.log("deleting link");
				console.log(metamodel.links[lnkidx]);*/
			}
		}
		metamodel.links = newlnks;

		// extra step
		// components we added have no parent id
		// we need to find a link pointing to, or from that component, and get the z from the other end
		// ye it sucks
		for (let newacmidx in ACMs) {
			let newacm = ACMs[newacmidx];
			let targetlinks = [];
			let sourcelinks = [];
			// find nodes communicating with current ACM
			for (let lnkidx in metamodel.links) {
				let lnk = metamodel.links[lnkidx];
				if (!lnk.from || lnk.from.id === newacm.id) {
					targetlinks.push(lnk);
				}
				if (!lnk.to || lnk.to.id === newacm.id) {
					sourcelinks.push(lnk);
				}
			}

			// meme way to eliminate duplicates
			targetlinks = [...new Set(targetlinks)];
			sourcelinks = [...new Set(sourcelinks)];
			if (targetlinks.length === 0) {
				// how did you get there
				console.log("error: acm with no incoming links?????");
			} else if (targetlinks.length === 1) {
				// only one output, plop ACM in the flow with that node
				newacm.id_parent = targetlinks[0].to.id_parent;

				// let's also fix x and y
				newacm.x = targetlinks[0].to.x - 100;
				newacm.y = targetlinks[0].to.y;

				// fix link references
				targetlinks[0].from = newacm;
				for (let srclnkidx in sourcelinks) {
					sourcelinks[srclnkidx].to = newacm;
				}

				// and add it to the metamodel
				metamodel.components.push(newacm);
			} else {
				// more than output, duplicate ACM in each flow
				let newacmids = {};
				// make a list of flows to make nodes for
				for (let targetidx in targetlinks) {
					let targetlnk = targetlinks[targetidx];
					if (!newacmids[targetlnk.to.id_parent]) {
						newacmids[targetlnk.to.id_parent] = generateNRID();
					}
				}

				// create acms
				for (let newacmid_parent in newacmids) {
					// create new acm node, copy of "floating" one but with id_parent to link destination
					let newacmcopy = new ACMMetamodel.ACMComponent(newacmids[newacmid_parent], newacm.name, newacm.x, newacm.y, newacm.type, newacmid_parent, newacm.acm_type, newacm.strategy, false, newacm.name);

					// update links
					for (let targetlnkidx in targetlinks) {
						let targetlnk = targetlinks[targetlnkidx];
						if (targetlnk.to.id_parent === newacmid_parent) {
							targetlnk.from = newacmcopy;

							// fix x and y
							newacmcopy.x = targetlnk.to.x - 100;
							newacmcopy.y = targetlnk.to.y;
						}
					}
					for (let sourcelnkidx in sourcelinks) {
						let srclnk = sourcelinks[sourcelnkidx];
						if (srclnk.from.id_parent === newacmid_parent) {
							srclnk.to = newacmcopy;
						}
					}

					// plop the new acm in the metamodel
					metamodel.components.push(newacmcopy);
				}
			}
		}

		callback(metamodel);
	});
};

var ggxtypedic = {
    Monitor: "I6",
    ACMComponent: "I3",
    Action: "I4",
    PhysicalProcess: "I5",
    SoftwareComponent: "I2",
    Link: "I7",
    default: "I2"
};

function getGGXTypeForMetamodelType(component) {
	if (component instanceof ACMMetamodel.Monitor) {
        return ggxtypedic.Monitor;
	}
	if (component instanceof ACMMetamodel.ACMComponent) {
        return ggxtypedic.ACMComponent;
	}
	if (component instanceof ACMMetamodel.Action) {
        return ggxtypedic.Action;
	}
	if (component instanceof ACMMetamodel.PhysicalProcess) {
        return ggxtypedic.PhysicalProcess;
	}
    if (component instanceof ACMMetamodel.SoftwareComponent) {
        return ggxtypedic.SoftwareComponent;
    }

    return ggxtypedic.default;
}

function processGGXTypes(types) {
    // node types
    for (let typeidx in types.NodeType) {
        let nodeType = types.NodeType[typeidx].$;
        switch (nodeType.name.split("%")[0]) {
            case "softComp":
                ggxtypedic.SoftwareComponent = nodeType.ID;
                break;
            case "ACM":
                ggxtypedic.ACMComponent = nodeType.ID;
                break;
            case "Action":
                ggxtypedic.Action = nodeType.ID;
                break;
            case "physical":
                ggxtypedic.PhysicalProcess = nodeType.ID;
                break;
            case "Monitor":
                ggxtypedic.Monitor = nodeType.ID;
                break;
            default: break;
        }
    }

    // link type
    ggxtypedic.Link = types.EdgeType[0].$.ID;

    // copy softcomp to default
    ggxtypedic.default = ggxtypedic.SoftwareComponent;

    console.log("Running GGX conversion using type dictionary:\n");
    finalLog(ggxtypedic);
    console.log("---------------");
}

function generateNRID() {
	return generateID(8) + "." + generateID(6);
}

// generate hex id https://stackoverflow.com/a/27747377
// dec2hex :: Integer -> String
function dec2hex(dec) {
	return ('0' + dec.toString(16)).substr(-2);
}

// generateId :: Integer -> String
function generateID(len) {
	var arr = new Uint8Array((len || 40) / 2);
	crypto.randomFillSync(arr);
	return Array.from(arr, dec2hex).join('');
}

function finalLog(o) {
	console.log(util.inspect(o, false, null, true));
}