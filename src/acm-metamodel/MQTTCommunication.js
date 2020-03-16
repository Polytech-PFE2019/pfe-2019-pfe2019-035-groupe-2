var CommunicationComponent = require("./CommunicationComponent.js");
var Link = require("./Link.js");


class MQTTCommunication extends CommunicationComponent {
    constructor(id, name, x, y, type, id_parent,isOutNode, broker, topic) {
        super(id, name, x, y, type, id_parent,isOutNode);
        this.broker = broker
        this.topic =topic
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

    match(mqttComponent,metamodel){
        //works only in good order. Needs to be rework
        if((this.broker==mqttComponent.broker)&&(areTopicsMatching(this.topic,mqttComponent.topic))&&(this.isOutNode != mqttComponent.isOutNode)){
            if(this.isOutNode){
                metamodel.links.push(new Link(links.length,"link"+links.length,0,0,this,mqttComponent));
            }else{
                metamodel.links.push(new Link(links.length,"link"+links.length,0,0,mqttComponent,this));            
            }
        }
    }
    
}




function areTopicsMatching(filter, topic) {
	const filterArray = filter.split('/')
	const length = filterArray.length
	const topicArray = topic.split('/')
  
	for (var i = 0; i < length; ++i) {
	  var left = filterArray[i]
	  var right = topicArray[i]
	  if (left === '#') return topicArray.length >= length - 1
	  if (left !== '+' && left !== right) return false
	}
  
	return length === topicArray.length
  }



module.exports = MQTTCommunication;
