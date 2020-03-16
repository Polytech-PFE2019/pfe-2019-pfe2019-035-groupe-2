var SoftwareComponent = require("./SoftwareComponent.js");


class CommunicationComponent extends SoftwareComponent {
    constructor(id, name, x, y, type, id_parent, configuration) {
        super(id, name, x, y, type, id_parent);
        this.configuration = configuration;
    }

    buildNodeRedJson() {
        let json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        json.z = this.id_parent;
        json.x = this.x;
        json.y = this.y;

        json.wires = [[]];
        return json;
    }
}

module.exports = CommunicationComponent;
