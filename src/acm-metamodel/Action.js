var SoftwareComponent = require("./SoftwareComponent.js");


class Action extends SoftwareComponent {
    constructor(id, name, x, y, type, id_parent, physicalProcess = []) {
        super(id, name,x,y, type, id_parent);
        this.physicalProcess = physicalProcess;
    }

    addPhysicalProcess(physicalProcess){
        physicalProcesses.push(physicalProcess);
    }

    //change generation with the accurate data needed
    buildNodeRedJson(){
        var json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        json.z = this.id_parent;
        json.x = this.x;
        json.y = this.y;
        json.active = true;
        json.tosidebar = true;
        json.console = false;
        json.tostatus = false;
        json.complete = "payload";
                
        json.wires = [[]];
        return json;
    }
}

module.exports = Action;
