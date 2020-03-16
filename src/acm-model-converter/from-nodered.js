/**
 * from node red to pivot model
 **/
const util = require('util');
var exports = module.exports = {};
const http = require("http");
const URL = require('url').URL;
const acm_metamodel = require("acm-metamodel");

var SoftwareComponent = acm_metamodel.SoftwareComponent;
var Action = acm_metamodel.Action;
var Monitor = acm_metamodel.Monitor;
var ACMComponent = acm_metamodel.ACMComponent;
var Link = acm_metamodel.Link;
var Metamodel = acm_metamodel.Metamodel;

var WebsocketC = acm_metamodel.WebsocketC;
var AMQPC = acm_metamodel.AMQPCommunication;
var HTTPC = acm_metamodel.HTTPCommunication;

var componentType = acm_metamodel.componentType;
var actionType = acm_metamodel.actionType;
var ACMType = acm_metamodel.ACMType;
var monitorType = acm_metamodel.monitorType;
//communication
var httpRequestType = acm_metamodel.httpRequestType;
var httpInType = acm_metamodel.httpInType;
var httpOutType = acm_metamodel.httpOutType;
var websocketInType = acm_metamodel.websocketInType;
var websocketOutType = acm_metamodel.websocketOutType;
var AMQPInType = acm_metamodel.AMQPInType;
var AMQPOutType = acm_metamodel.AMQPOutType;

// processing type registry
let ProcessingRegistry = require('./DynamicProcessingTypesRegistry');

exports.fromURL = function (nodeRedFlowURL, callback, url) {
	console.log("nr flow url::" + nodeRedFlowURL);
	url = new URL(nodeRedFlowURL);
	var options = {
		path: url.pathname,
		host: url.hostname,
		port: url.port,
		method: 'GET'
    };

    // detect a flow UI url and replace it by an API url
    if (url.pathname === '/') {
        nodeRedFlowURL = nodeRedFlowURL.replace("#", "");
        console.log("nr flow url CORRECTED::" + nodeRedFlowURL);
        url = new URL(nodeRedFlowURL);
        var options = {
            path: url.pathname,
            host: url.hostname,
            port: url.port,
            method: 'GET'
        };
    }

	var req = http.request(options, function (httpIncomingMessage) {
		var nodeRedFlowResponse = "";
		httpIncomingMessage.setEncoding('utf8');
		httpIncomingMessage.on('data', (chunk) => {
			nodeRedFlowResponse += chunk;
		});
        httpIncomingMessage.on('end', () => {
			exports.fromString(nodeRedFlowResponse, callback, url.href);
			//console.log(nodeRedFlowResponse);
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
};

exports.fromString = function (nodeRedFlowStr, callback, url) {
	try {
		var flow = JSON.parse(nodeRedFlowStr);
	} catch (e) {
		console.log("unable to parse json " + nodeRedFlowStr);
		return;
	}
	return exports.fromJSON(flow, callback, url);
};

exports.fromJSON = function (nodeRedFlow, callback, url) {
    //creating all software components and parts of links
    let softwareComponents = [];
    let links = [];

    // the loaded model is a dumb node list
    // we need to make it some sort of object to hold extra data
    if (nodeRedFlow.nodes === undefined) {
        nodeRedFlow = {
            nodes: nodeRedFlow,
            isACMGeneratedModel: true,
            label: "Flow",
            id: null
        };
    }
    let nodesList = nodeRedFlow.nodes;

    for (var i = 0; i < nodesList.length; i++) {
        // update id
        if (!nodeRedFlow.id && nodesList[i].z !== "") nodeRedFlow.id = nodesList[i].z;
        var component = null;
        switch (nodesList[i].type) {
			/*case componentType:
				component = new SoftwareComponent(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, componentType, nodesList[i].z);
				softwareComponents.push(component);
				break;*/
			/*case actionType:
				component = new Action(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, actionType, nodesList[i].z);
				softwareComponents.push(component);
				break;*/
            case ACMType:
                /*console.log("acm from nodered");
                console.log(nodesList[i]);*/
                component = new ACMComponent(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, ACMType, nodesList[i].z, "classic", "the_best", true, nodesList[i].id, true);
                component.setParamsFromNodeRed(nodesList[i]);
                softwareComponents.push(component);
                break;
            case acm_metamodel.ACMSyncType:
                /*console.log("acm sync from nodered");
                console.log(nodesList[i]);*/
                component = new ACMComponent(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, acm_metamodel.ACMSyncType, nodesList[i].z, "classic", "the_best", true, nodesList[i].id.split("_sync")[0], true);
                component.setParamsFromNodeRed(nodesList[i]);
                softwareComponents.push(component);
                break;
            case acm_metamodel.ACMTagType:
                /*console.log("acm tag from nodered");
                console.log(nodesList[i]);*/
                component = new ACMComponent(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, acm_metamodel.ACMTagType, nodesList[i].z, "classic", "the_best", true, nodesList[i].id.split("-tag-")[0], true);
                component.setParamsFromNodeRed(nodesList[i]);
                softwareComponents.push(component);
                break;
            case monitorType:
                component = new Monitor(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, monitorType, nodesList[i].z, "monitor", null, null, true, true);
                component.setParamsFromNodeRed(nodesList[i]);
                softwareComponents.push(component);
                break;
           
            /*case websocketInType:
                var client;
                for (let l = 0; l < nodesList.length; l++) {
                    if (nodesList[i].client === nodesList[l].id) {
                        client = nodesList[l].path;
                    }
                }
                component = new WebsocketC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, websocketInType, nodesList[i].z, false, client);
                softwareComponents.push(component);
                break;
            case websocketOutType:
                var outclient;
                for (let m = 0; m < nodesList.length; m++) {
                    if (nodesList[i].outclient === nodesList[m].id) {
                        outclient = nodesList[m].path;
                    }
                }
                component = new WebsocketC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, websocketOutType, nodesList[i].z, true, outclient);
                softwareComponents.push(component);
                break;
            case AMQPInType:
                component = new AMQPC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, AMQPInType, nodesList[i].z, false, nodesList[i].client);
                softwareComponents.push(component);
                break;
            case AMQPOutType:
                component = new AMQPC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, AMQPOutType, nodesList[i].z, true, nodesList[i].client);
                softwareComponents.push(component);
                break;

            case httpRequestType:
                component = new HTTPC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, httpRequestType, nodesList[i].z, undefined, nodesList[i].url);
                softwareComponents.push(component);
                break;
            case httpInType:
                component = new HTTPC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, httpInType, nodesList[i].z, false, url + nodesList[i].url);
                softwareComponents.push(component);
                break;
            case httpOutType:
                component = new HTTPC(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, httpInType, nodesList[i].z, true, url);
                softwareComponents.push(component);
                break;*/

            case acm_metamodel.flowType:
            case acm_metamodel.commentType:
                break;

            default:
                // first check if the node can be processed using the type registry
                if (ProcessingRegistry.registry[nodesList[i].type]) {
                    component = ProcessingRegistry.registry[nodesList[i].type](nodesList[i], nodesList);
                    if (component) {
                        softwareComponents.push(component);
                    }
                } else {
                    // anything that isn't a special protected type is a software component
                    component = new SoftwareComponent(nodesList[i].id, nodesList[i].name, nodesList[i].x, nodesList[i].y, nodesList[i].type, nodesList[i].z);
                    softwareComponents.push(component);
                }
                break;
        }

        if (component === null) continue;

        //get all links
        if (nodesList[i].wires) {
            for (let port in nodesList[i].wires) {
                for (let j = 0; j < nodesList[i].wires[port].length; j++) {
                    links.push(new Link("Lnk_" + nodesList[i].id + "_" + nodesList[i].wires[port][j], nodesList[i].id + "_" + nodesList[i].wires[port][j], component.x, component.y, component, nodesList[i].wires[port][j], port));
                }
            }
        }
    }
    //updating the "to" field of links
    // delete broke links with no valid "to" target
    let newLinks = [];
	for (let i = 0; i < links.length; i++) {
		for (let j = 0; j < softwareComponents.length; j++) {
			if (links[i].to === softwareComponents[j].id) {
                links[i].to = softwareComponents[j];
                if (links[i].to) {
                    newLinks.push(links[i]);
                }
			}
		}
    }
    links = newLinks;

	// tag nrflow as nr model for later reconstruction
    nodeRedFlow.acm_model_type = "nodered";
    nodeRedFlow.url = url;
	var models = new Metamodel(softwareComponents, links, nodeRedFlow);
	callback(models);
};