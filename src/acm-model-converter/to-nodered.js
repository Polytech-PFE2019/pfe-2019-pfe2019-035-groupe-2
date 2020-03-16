const acm_metamodel = require("acm-metamodel");

const ACMComponent = acm_metamodel.ACMComponent;
const CommunicationComponent = acm_metamodel.CommunicationComponent;

// processing type registry
let ProcessingRegistry = require('./DynamicProcessingTypesRegistry');

const util = require('util');

var exports = module.exports = {};

exports.fromModel = fromModel;

function fromModel(model, callback) {
	console.log("to-nodered fromModel");

	let flow = model.models;
	let nodesList = flow.nodes;
	if(nodesList === undefined){
		nodesList = flow;
	}
	delete flow.acm_model_type;

	let nodebuff = {};
    let lowx = Number.MAX_VALUE;
    let lowy = Number.MAX_VALUE;
	// process components
	model.components.forEach((component) => {
        if (component instanceof ACMComponent) {
            if (component.configured) {
                let newnode = component.buildNodeRedJson();
                nodebuff[component.id] = newnode;

                // replace node if already deployed previously
                let prevnodeidx = nodesList.findIndex(node => node.id === component.id);
                if (prevnodeidx !== -1) {
                    nodesList.splice(prevnodeidx, 1);
                }
            }
        } else if (component.configuration && component.configuration.generator/*component instanceof CommunicationComponent*/) {
            // communication components use the dynamic type rebuilder logic
            let newnode = ProcessingRegistry.generatorFunctions[component.configuration.generator](component);
            nodebuff[component.id] = newnode;

            // replace node if already deployed previously
            let prevnodeidx = nodesList.findIndex(node => node.id === component.id);
            if (prevnodeidx !== -1) {
                nodesList.splice(prevnodeidx, 1);
            }
        } else {
			// non metamodel node
			let rawnodeidx = nodesList.findIndex(node => node.id === component.id);
			let rawnode = nodesList[rawnodeidx];

			// it is however needed to remove existing links
			rawnode.wires = [];
			// and update positions
			rawnode.x = component.x;
			rawnode.y = component.y;

			nodebuff[rawnode.id] = rawnode;

			// and delete that node from the list of non processed nodes
			nodesList.splice(rawnodeidx, 1);
		}

		// store lowest coordinates for flow
		if (component.x > 0 && lowx > component.x) {
			lowx = component.x;
		}
        if (component.y > 0 && lowy > component.y) {
			lowy = component.y;
		}
	});

	// process links, that need to be added to the compoonents
	model.links.forEach((link) => { 
        if (nodebuff[link.from.id] && !link.virtual) {
            // initialize the port if needed
            if (!nodebuff[link.from.id].wires[link.port]) { nodebuff[link.from.id].wires[link.port] = []; }

			if (link.to instanceof ACMComponent && !link.to.configured) {
				nodebuff[link.from.id].wires[link.port].push(model.links.find(lnk => lnk.from.id === link.to.id).to.id);
			} else {
				nodebuff[link.from.id].wires[link.port].push(link.to.id);
			}
		}
	});

	// copy all the softcomps to flow
	flow.nodes = Object.keys(nodebuff).map(function (key) { return nodebuff[key]; });

	// reprocess components to have them moved out of negative coordinates
    lowx -= 100;
    lowy -= 100;
	flow.nodes.forEach(component => {
		component.x -= lowx;
		component.y -= lowy;
	});

    // update all acm sync nodes to use that mqtt broker
    let mqttneeded = false;
    flow.nodes.forEach(node => {
        if (node.type === "acm-sync") {
            mqttneeded = true;
            node.brokerAddress = "mqtt://localhost:18883";
        }
    });
    if (mqttneeded) {
        // slap in an MQTT broker with a funky port
        let mqttbroker = { "id": "bf93afb6.0dbf6", "type": "mosca in", "z": "ef9a1111.8c6dd", "mqtt_port": "18883", "mqtt_ws_port": "", "name": "acm broker", "username": "", "password": "", "dburl": "", "x": 70, "y": 20, "wires": [[]] };
        flow.nodes.push(mqttbroker);
    }

	// process bullshit nodes with no z values like mqtt broker configs, that sort of garbage
	// they should be the only ones left in nodesList, append to processed nodes
	flow.nodes.push(...nodesList);

	callback(flow, mqttneeded);
}

function finalLog(o) {
	console.log(util.inspect(o, false, null, true));
}