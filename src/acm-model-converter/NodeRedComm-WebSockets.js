let acm_metamodel = require("acm-metamodel");
const url = require('url');

let CommComp = acm_metamodel.CommunicationComponent;
let Link = acm_metamodel.Link;
let websocketInType = acm_metamodel.websocketInType;
let websocketOutType = acm_metamodel.websocketOutType;
let websocketClientType = acm_metamodel.websocketClientType;
let websocketListenerType = acm_metamodel.websocketListenerType;

const utils = require("./utils");
let findGenesisParentIP = utils.findGenesisParentIP;
let findGenesisNodeRedPort = utils.findGenesisNodeRedPort;

let ws = {
    // map ws detection functions to known ws types
    register: function (registry, matchFunctions, generatorFunctions) {
        registry[websocketInType] = this.processWsIn;
        registry[websocketOutType] = this.processWsOut;
        registry[websocketClientType] = this.processWsClient;
        registry[websocketListenerType] = this.processWsListener;

        matchFunctions["WebSockets"] = this.identifyMatches;

        generatorFunctions["WebSockets"] = this.generateNode;
    },

    // identify matches on a full WIMAC model
    identifyMatches: function (model) {
        // list config nodes
        let confnodes = model.components.filter(cmp => cmp instanceof CommComp && cmp.configuration.ws && cmp.configuration.isconfignode);

        // map NRIDs to IP:port
        let pathmap = {};
        confnodes.forEach(confnode => {
            let fullpath = confnode.configuration.path;
            // try to find the host IP for listen or localhost
            if (!confnode.configuration.path.startsWith("ws") || confnode.configuration.path.indexOf("://localhost")>0 ){
                switch (model.models.acm_model_type) {
                    case "nodered":
                        // nodered, get the hostname from the path variable
                        // this is probably unreliable for flows loaded from a file?
                        try {
                            let nrurl = url.parse(model.models.url);
                            if (confnode.configuration.path.startsWith("ws")) {
                                // its a localhost, replace it by ip
                                fullpath = fullpath.replace("localhost", nrurl.hostname);
                            } else {
                                // it's a no url append it to start
                                fullpath = "ws://" + nrurl.hostname + ":" + nrurl.port + fullpath;
                            }
                        } catch (e) { console.error("exception parsing brokerpath is url empty??"); console.error(model.models.url); console.error(e); }
                        break;
                    case "genesis":
                        let nrip = findGenesisParentIP(model.models.dm, confnode);
                        if (confnode.configuration.path.startsWith("ws")) {
                            // its a localhost, replace it by ip
                            fullpath = fullpath.replace("localhost", nrip);
                        } else {
                            let nrport = findGenesisNodeRedPort(model.models.dm, confnode);
                            // it's a no url append it to start
                            fullpath = "ws://" + nrip + ":" + nrport +  fullpath;
                        }
                        break;
                    default: console.error("MQTT identifymatches unknown model type " + model.models.acm_model_type); break;
                }
            }
            pathmap[confnode.id] = fullpath;
        });

        // process mqtt components, adding them to a ip:port/topic map to find who talks on what
        let wspathmap = {};
        let wscomps = model.components.filter(cmp => cmp instanceof CommComp && cmp.configuration.ws && !cmp.configuration.isconfignode);
        wscomps.forEach(cmp => {
            //console.log(cmp);
            let cmppath = pathmap[cmp.configuration.url];
            if (wspathmap[cmppath]) {
                wspathmap[cmppath].push(cmp);
            } else {
                wspathmap[cmppath] = [cmp];
            }
        });

        // for each ip:port/topic group link inputs to outputs
        // plot twist: in node red mqtt, inputs are relative to the flow ergo they're the receivers
        // symetrically outputs are givers
        // so links go from mqtt out to mqtt in
        for (let iptopic in wspathmap) {
            let siblings = wspathmap[iptopic];
            // get all the in siblings' id for links
            let inputs = siblings.filter(cmp => cmp.configuration.input).map(cmp => model.components.find(cc => cc.id === cmp.id));

            // create the links between outputs and inputs
            let links = [];
            siblings.filter(cmp => cmp.configuration.output).forEach(cmp => inputs.forEach(input => links.push(new Link("v_" + cmp.id + "_" + input.id, "v_" + cmp.id + "_" + input.id, 0, 0, cmp, input, 0, true))));
            model.links.push(...links);
        }
        //console.log(mqttcomps);
    },

    // ws in 
    processWsIn: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, websocketInType, node.z, { ws: true, generator: "WebSockets", url: node.server||node.client, input: "yes in the nodered sense" });
    },

    // ws out 
    processWsOut: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, websocketOutType, node.z, { ws: true, generator: "WebSockets", url: node.server || node.client, output: "yes in the nodered sense" });
    },

    // ws client: config node for ws connecting to server 
    processWsClient: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, websocketClientType, node.z, { ws: true, generator: "WebSockets", path: node.path, isconfignode: true, raw: node, output: "yes in the nodered sense" });
    },

    // ws listener: config node for ws listening on server
    processWsListener: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, websocketListenerType, node.z, { ws: true, generator: "WebSockets", path: node.path, isconfignode: true, raw: node, output: "yes in the nodered sense" });
    },

    // generate nr code from wimac comp
    generateNode: function (component) {
        // configuring an mqtt in/out
        if (!component.configuration.isconfignode) {
            // get base node
            let base = component.buildNodeRedJson();
            // add mqtt specific parameters
            base.broker = component.configuration.broker;
            base.topic = component.configuration.topic;
            base.qos = component.configuration.qos;

            // add in/out specific parameters
            if (component.configuration.datatype) {
                base.datatype = component.configuration.datatype;
            }
            if (component.configuration.retain) {
                base.retain = component.configuration.retain;
            }
            console.log(base);
            return base;
        } else {
            // mqtt broker
            return component.configuration.raw;
        }
    }
}

module.exports = ws;