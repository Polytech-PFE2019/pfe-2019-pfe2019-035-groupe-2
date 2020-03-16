
const acm_metamodel = require("acm-metamodel");
var Metamodel = acm_metamodel.Metamodel;


var toNodered = require("./to-nodered.js");

var exports = module.exports = {};
exports.fromModel = fromModel;


function fromModel(model, callback) {
	var genesis = model.models;
	//genesis.url = model.url;

    for (var i = 0; i < genesis.dm.components.length; i++) {
        if (genesis.dm.components[i].nr_flow && genesis.dm.components[i].nr_flow.length > 0) {
            var current_id = genesis.dm.components[i].nr_flow[0].z;
			var subModelComponents = [];
			var subModelLinks = [];

            for (var j = 0; j < model.components.length; j++) {
                if (current_id === model.components[j].id_parent) {
					subModelComponents.push(model.components[j]);
                    //add links of current component
                }
            }
            for (j = 0; j < model.links.length; j++) {
                //checking only the origin for the moment but can be upgraded to check destination
                if (model.links[j].from.id_parent === current_id) {
					subModelLinks.push(model.links[j]);
                }
            }
            var subMetamodel = new Metamodel(subModelComponents, subModelLinks, genesis.dm.components[i].nr_flow);
            subMetamodel.acm_model_type = "";
            toNodered.fromModel(subMetamodel, function (new_flow, acmgens) {
                // genesis probably only eats the retarded node array
                genesis.dm.components[i].nr_flow = new_flow.nodes;

                if (acmgens) {
                    // add package ref to install
                    genesis.dm.components[i].packages.push("enact-actuation-conflict-manager-node");
                    genesis.dm.components[i].packages.push("node-red-contrib-mqtt-broker");
                }
			});


			// add mounts
			/*genesis.dm.components[i].docker_resource.mounts = {
				type: "bind", 
				src: "/sources/actuation_conflict_manager_nodes",
				tgt: "/mnt/actuation_conflict_manager_nodes"
			};*/
        }
    }

    callback(genesis);
}