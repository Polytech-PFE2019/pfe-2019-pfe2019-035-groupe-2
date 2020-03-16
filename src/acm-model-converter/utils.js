var exports = module.exports = {};

exports.findGenesisParentIP = function (dm, target){
    for (let gencmpidx in dm.components) {
        let gencmp = dm.components[gencmpidx];
        if (gencmp.nr_flow && gencmp.nr_flow.find(node => node.id === target.id)) {
            // this should take care of n-levels genesis nesting, hopefully
            while (gencmp && !gencmp.ip) {
                let containment = dm.containments.find(cont => cont.target.split("/")[1] === gencmp.name)
                gencmp = dm.components.find(gencmp2 => gencmp2.name === containment.src.split("/")[1]);
            }
            return gencmp.ip;
        }
    }
}

exports.findGenesisNodeRedPort = function (dm, target) {
    for (let gencmpidx in dm.components) {
        let gencmp = dm.components[gencmpidx];
        if (gencmp.nr_flow && gencmp.nr_flow.find(node => node.id === target.id)) {
            return gencmp.required_communication_port[0].port_number;
        }
    }
}