var ACMComponent = require("./ACMComponent.js");


class Monitor extends ACMComponent {
	constructor(id, name, x, y, type, id_parent, acm_type, strategy, action, configured, deployed = false) {   
        super(id, name,x,y, type, id_parent, acm_type, strategy, configured, null, deployed);
        this.action = action;
	}

    setParamsFromNodeRed(node) {
        this.action = {
            montype: node.montype,
            action: node.action,
            source: node.source,
            destination: node.destination,
            mqttAddress: node.mqttAddress
        };
    }

    buildNodeRedJson(){
        var json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        json.z = this.id_parent;
        json.x = this.x;
        json.y = this.y;

        json.montype = this.action.montype;
        json.action = this.action.action;
        json.source = this.action.source;
        json.destination = this.action.destination;
        json.mqttAddress = this.action.mqttAddress;
        
        json.wires = [[]];
        return json;
    }
}

module.exports = Monitor;
