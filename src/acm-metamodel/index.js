var ACMComponent = require("./ACMComponent");
var ACMElement = require("./ACMElement");
var Action = require("./Action");
var Link = require("./Link");
var Metamodel = require("./Metamodel");
var Monitor = require("./Monitor");
var PhysicalProcess = require("./PhysicalProcess");
var SoftwareComponent = require("./SoftwareComponent");
var CommunicationComponent = require("./CommunicationComponent");

var exports = module.exports = {};
exports.ACMComponent = ACMComponent;
exports.ACMElement = ACMElement;
exports.Action = Action;
exports.Link = Link;
exports.Metamodel = Metamodel;
exports.Monitor = Monitor;
exports.PhysicalProcess = PhysicalProcess;
exports.SoftwareComponent = SoftwareComponent;
exports.CommunicationComponent = CommunicationComponent;


exports.componentType = "function";
exports.actionType = "debug";
exports.ACMType = ACMComponent.ACMType;
exports.ACMSyncType = ACMComponent.ACMSyncType;
exports.ACMTagType = ACMComponent.ACMTagType;
exports.monitorType = "acm-monitor";
exports.MQTTInType = "mqtt in";
exports.MQTTOutType = "mqtt out";
exports.MQTTBrokerType = "mqtt-broker";

exports.websocketInType = "websocket in";
exports.websocketOutType = "websocket out";
exports.websocketClientType = "websocket-client";
exports.websocketListenerType = "websocket-listener";

exports.MoscaInType = "mosca in";
exports.httpRequestType = "	http request";
exports.httpInType = "http in";
exports.httpOutType = "http response";
exports.AMQPInType = "amqp2 in";
exports.AMQPOutType = "amqp2 out";

// comment type, to skip them
exports.commentType = "comment";
exports.flowType = "tab";

// rebuild metamodel function
// builds classes from typeless json
exports.rebuildMetamodel = function(model) {
    let mmcomponents = [];
    for (let cmpidx in model.components) {
        let newcomp = null;
        let component = model.components[cmpidx];
        let type = component.elementType;
        switch (type) {
            case "SoftwareComponent":
                newcomp = new SoftwareComponent(component.id, component.name, component.x, component.y, component.type, component.id_parent);
                break;
            case "ACMComponent":
                newcomp = new ACMComponent(component.id, component.name, component.x, component.y, component.type, component.id_parent, component.acm_type, component.strategy, component.configured, component.id_conflict, component.deployed);
                newcomp.id_conflict = component.id_conflict;
                break;
            case "Action":
                // also rebuild phy procs
                let phyprox = [];
                for (let phyprocidx in component.physicalProcess) {
                    phyprox.push(new PhysicalProcess(component.physicalProcess[phyprocidx].id, component.physicalProcess[phyprocidx].name, component.physicalProcess[phyprocidx].x, component.physicalProcess[phyprocidx].y));
                }
                newcomp = new Action(component.id, component.name, component.x, component.y, component.type, component.id_parent, phyprox);
                break;
            case "Monitor":
                newcomp = new Monitor(component.id, component.name, component.x, component.y, component.type, component.id_parent, component.acm_type, component.strategy, component.action, component.configured, component.deployed);
                newcomp.id_conflict = component.id_conflict;
                break;
            case "CommunicationComponent":
                newcomp = new CommunicationComponent(component.id, component.name, component.x, component.y, component.type, component.id_parent, component.configuration);
                break;
            default: console.log("rebuildmetamodel::unknown type " + type); continue;
        }
        mmcomponents.push(newcomp);
    }
    model.components = mmcomponents;

    let mmlinks = [];
    for (let lnkidx in model.links) {
        let link = model.links[lnkidx];

        let newlink = new Link(link.id, link.name, link.x, link.y, model.components.find(cmp => cmp.id === link.from.id), model.components.find(cmp => cmp.id === link.to.id), link.port, link.virtual);
        mmlinks.push(newlink);
    }
    model.links = mmlinks;

    return model;
}
