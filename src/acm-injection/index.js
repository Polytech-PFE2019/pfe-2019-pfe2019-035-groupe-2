var instantiation = require("acm-instantiation");
var acm_metamodel = require("acm-metamodel");

var Monitor = acm_metamodel.Monitor;
var ACMComponent = acm_metamodel.ACMComponent;
var Action = acm_metamodel.Action;

var exports = module.exports = {};
exports.injectNodes = injectNodes;


function injectNodes(model, callback) {
	// process acm components
	let monitors = [], acms = [];
	for (let cmpidx in model.components) {
		let component = model.components[cmpidx];
		// only treat configured nodes
		if (component.configured && !component.deployed) {
			console.log("nu comp");
			if (component instanceof Monitor) {
                let monitordata = instantiation.instantiateMonitor(component);
				monitors.push(monitordata);

			} else if (component instanceof ACMComponent) {
				let acmdata = instantiation.instantiateACM(model, component);
				acms.push(acmdata);
			}
		}
	}

	// process monitors
	for (let monidx in monitors) {
		// find and replace monitor in component list in case something is updated 
		for (let moncmpidx in model.components) {
			if (model.components[moncmpidx].id === monitors[monidx].id) {
				model.components.splice(moncmpidx, 1);
				break;
			}
        }

        // get source and destination
        model.links.forEach(lnk => {
            if (lnk.from.id === monitors[monidx].id) {
                monitors[monidx].action.destination = lnk.to.id;
                // mon to action, set type
                if (lnk.to instanceof Action) {
                    monitors[monidx].action.montype = "action";
                }
            }
            if (lnk.to.id === monitors[monidx].id) {
                monitors[monidx].action.source = lnk.from.id;
            }
        });

        console.log(monitors[monidx]);

		model.components.push(monitors[monidx]);
	}

	// process acms
	for (let acmidx in acms) {
		let acmcomps = acms[acmidx].components;
		let acmlinks = acms[acmidx].links;
		let acm = acms[acmidx].acm;
		
		// find and replace acm in component list in case something is updated
		for (let acmcmpidx in model.components) {
			if (model.components[acmcmpidx].id === acm.id) {
				model.components.splice(acmcmpidx, 1);
				break;
			}
		}
		model.components.push(acm);

		// add other generated acm components
		model.components.push(...acmcomps);

        let outputs = 0;
		for (let acmlnkidx in model.links) {
            let acmlnk = model.links[acmlnkidx];
		    // retarget acm in links so they point to syncs
            if (acmlnk.to.id === acm.id) {
                acmlnk.to = acmcomps.find(comp => comp.strategy === acmlnk.from.id);
            }

            // update acm to action links to give them different ports
            if (acmlnk.from.id === acm.id) {
                console.log(acmlnk);
                acmlnk.port = outputs;
                outputs++;
            }
        }
        acm.strategy.outputs = outputs;
        acm.outputs = outputs;

		// add other generated acm links
		model.links.push(...acmlinks);
	}

	callback(model);
}