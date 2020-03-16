var CommunicationComponent = require("./CommunicationComponent.js");
var Link = require("./Link.js");


class HTTPCommunication extends CommunicationComponent {
    constructor(id, name, x, y, type, id_parent,isOutNode, url) {
        super(id, name, x, y, type, id_parent,isOutNode);
        //can be true false or undefined. undefined is for request node
        this.url = url;
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

    match(HTTPComponent,metamodel){
        if(this.url===HTTPComponent.url){
            if((this.isOutNode==undefined) && (!HTTPComponent.isOutNode)){
                var endpoint = findEndpoint(HTTPComponent,metamodel.links);
                metamodel.links.push(new Link(links.length,"link"+links.length,0,0,this,HTTPComponent));
                for(var i =0;i<metamodel.links.length;i++){
                    if(metamodel.links[i].from == this){
                        metamodel.links[i].from = endpoint;
                    }
                }
            }
        }
    }
}

//super cost. We have to find another way to find endpoint.
//well apparently it is not even working... Maximum call stack size exceeded
function findEndpoint(component,links){
    for(var i = 0;i<links.length;i++){
        if(links[i].from === component){
            return findEndpoint(links[i].to,links);
        }
    }
    return component;
    
}


module.exports = HTTPCommunication;
