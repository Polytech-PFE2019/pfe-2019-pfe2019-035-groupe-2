var CommunicationComponent = require("./CommunicationComponent.js");
var Link = require("./Link.js");


class AMQPCommunication extends CommunicationComponent {
    constructor(id, name, x, y, type, id_parent,isOutNode, client) {
        super(id, name, x, y, type, id_parent,isOutNode);
        this.client = client
    }

    //to change
    buildNodeRedJson() {
        var json = {};
        json.id = this.id;
        json.name = this.name;
        json.type = this.type;
        //json.z = this.id_parent;
        json.x = this.x;
        json.y = this.y;
        json.fieldType = "msg";
        json.format = "handlebars";
        json.syntax = "mustache";
        json.template = "This is the payload: {{payload}} !";
        json.output = "str";

        json.wires = [[]];
        return json;
    }

    match(AMPQComponent,metamodel){
        if(this.client==AMPQComponent.client){
            if(this.isOutNode){
                metamodel.links.push(new Link(links.length,"link"+links.length,0,0,this,AMPQComponent));
            }else{
                metamodel.links.push(new Link(links.length,"link"+links.length,0,0,AMPQComponent,this));            
            }
        }
    }
}





module.exports = AMQPCommunication;