var SoftwareComponent = require("./SoftwareComponent.js");

class ACMComponent extends SoftwareComponent {
	// big thinks
	static get ACMType() {
		return "acm";
	}

	static get ACMSyncType() {
		return "acm-sync";
	}

	static get ACMTagType() {
		return "acm-tag";
	}

    constructor(id, name,x,y, type, id_parent, acm_type, strategy, configured = false, id_conflict = null, deployed = false) {
        super(id, name,x,y, type, id_parent);
        this.acm_type = acm_type;
		this.strategy = strategy;
		this.id_conflict = id_conflict;
		this.configured = configured;
		this.deployed = deployed;
	}

	setParamsFromNodeRed(node) {
		switch (this.type) {
			case ACMComponent.ACMType:
				this.strategy = JSON.parse(node.strategy);
				break;
			case ACMComponent.ACMSyncType:
				this.strategy = JSON.parse(node.payload).map(el => { return { tag: el }; });
				break;
			case ACMComponent.ACMTagType:
				this.strategy = node.tag;
				break;
			default:
				break;
		}
	}

    buildNodeRedJson(){
        var json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        json.z = this.id_parent;
        json.x = this.x;
		json.y = this.y;

		//console.log(this.name + "::" + this.type);

		switch (this.type) {
			case ACMComponent.ACMType:
				json.strategy = JSON.stringify(this.strategy);
				break;
			case ACMComponent.ACMSyncType:
				json.payload = JSON.stringify(this.strategy.map(el => el.tag));
				json.delay = 500;
				json.brokerAddress = "mqtt://localhost:1883";
				json.conflictID = this.id;
				break;
			case ACMComponent.ACMTagType:
				json.tag = this.strategy;
				break;
			default:
				json.defaultprop = this.type;
				break;
		}

        json.wires = [[]];
        return json;
    }
}

module.exports = ACMComponent;
