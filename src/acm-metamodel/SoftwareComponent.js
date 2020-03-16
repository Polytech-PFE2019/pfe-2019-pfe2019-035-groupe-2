var ACMElement = require("./ACMElement.js");


class SoftwareComponent extends ACMElement {
    constructor(id, name, x, y, type, id_parent) {
        super(id, name, x, y);
        this.type = type;
        this.id_parent = id_parent;
    }
    
    //change generation with the accurate data needed
    buildNodeRedJson(){
        var json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        json.z = this.id_parent;
        json.func = "\nreturn msg;";
        json.outputs = 1;
        json.noerr = 0;
        json.x = this.x;
        json.y = this.y;
        
        json.wires = [[]];
        return json;
    }
}

module.exports = SoftwareComponent;
