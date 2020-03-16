let acm_metamodel = require("acm-metamodel");
const url = require('url');

let CommComp = acm_metamodel.CommunicationComponent;
let Link = acm_metamodel.Link;
let MQTTInType = acm_metamodel.MQTTInType;
let MQTTOutType = acm_metamodel.MQTTOutType;
let MQTTBrokerType = acm_metamodel.MQTTBrokerType;
let MoscaInType = acm_metamodel.MoscaInType;

let findGenesisParentIP = require("./utils").findGenesisParentIP;

let mqtt = {
    // map mqtt detection functions to known mqtt types
    register: function (registry, matchFunctions, generatorFunctions) {
        registry[MoscaInType] = function () { };
        registry[MQTTBrokerType] = this.processBroker;
        registry[MQTTInType] = this.processMqttIn;
        registry[MQTTOutType] = this.processMqttOut;

        matchFunctions["MQTT"] = this.identifyMatches;

        generatorFunctions["MQTT"] = this.generateNode;
    },

    // identify matches on a full WIMAC model
    identifyMatches: function (model) {
        // list brokers
        let brokerscmp = model.components.filter(cmp => cmp instanceof CommComp && cmp.configuration.mqtt && cmp.configuration.ismqttbroker);
        
        // map NRIDs to IP:port
        let brokermap = {};
        brokerscmp.forEach(broker => {
            let brokerpath = broker.configuration.raw.broker + ":" + broker.configuration.raw.port;
            // try to find the host IP for localhost brokers
            if (broker.configuration.raw.broker === "localhost") {
                switch (model.models.acm_model_type) {
                    case "nodered":
                        // nodered, get the hostname from the path variable
                        // this is probably unreliable for flows loaded from a file?
                        try {
                            brokerpath = url.parse(model.models.url).hostname + ":" + broker.configuration.raw.port;
                        } catch (e) { console.error("exception parsing brokerpath is url empty??"); console.error(model.models.url); console.error(e);}
                        break;
                    case "genesis":
                        // locate genesis nr_flow with the broker
                        brokerpath = findGenesisParentIP(model.models.dm, broker) + ":" + broker.configuration.raw.port;
                        break;
                    default: console.error("MQTT identifymatches unknown model type " + model.models.acm_model_type); break;
                }
            }
            brokermap[broker.id] = brokerpath;
        });

        // process mqtt components, adding them to a ip:port/topic map to find who talks on what
        let mqttcompsurls = {};
        let mqttcomps = model.components.filter(cmp => cmp instanceof CommComp && cmp.configuration.mqtt && !cmp.configuration.ismqttbroker);
        mqttcomps.forEach(cmp => {
            //console.log(cmp);
            let iptopic = brokermap[cmp.configuration.broker] + "/" + cmp.configuration.topic;
            if (mqttcompsurls[iptopic]) {
                mqttcompsurls[iptopic].push(cmp);
            } else {
                mqttcompsurls[iptopic] = [cmp];
            }
        });

        // for each ip:port/topic group link inputs to outputs
        // plot twist: in node red mqtt, inputs are relative to the flow ergo they're the receivers
        // symetrically outputs are givers
        // so links go from mqtt out to mqtt in
        for (let iptopic in mqttcompsurls) {
            let siblings = mqttcompsurls[iptopic];
            // get all the in siblings' id for links
            let inputs = siblings.filter(cmp => cmp.configuration.input).map(cmp => model.components.find(cc => cc.id === cmp.id));

            // create the links between outputs and inputs
            let links = [];
            siblings.filter(cmp => cmp.configuration.output).forEach(cmp => inputs.forEach(input => links.push(new Link("v_" + cmp.id + "_" + input.id, "v_" + cmp.id + "_" + input.id, 0, 0, cmp, input, 0, true))));
            model.links.push(...links);
        }
        //console.log(mqttcomps);
    },

    // mqtt in 
    processMqttIn: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, MQTTInType, node.z, { mqtt:true, generator: "MQTT", broker:node.broker, topic: node.topic, qos: node.qos, datatype: node.datatype, input: "yes in the nodered sense" });
    },

    // mqtt out 
    processMqttOut: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, MQTTOutType, node.z, { mqtt: true, generator: "MQTT", broker: node.broker, topic: node.topic, qos: node.qos, retain: node.retain, output: "yes in the nodered sense" });
    },

    // brokers
    processBroker: function (node, nrmodel) {
        return new CommComp(node.id, node.name, node.x, node.y, MQTTBrokerType, node.z, { mqtt: true, generator: "MQTT", ismqttbroker: true, raw: node, noRender: true });
    },

    // generate nr code from wimac comp
    generateNode: function (component) {
        // configuring an mqtt in/out
        if (!component.configuration.ismqttbroker) {
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
        } else  {
            // mqtt broker
            return component.configuration.raw;
        }
    }
}

module.exports = mqtt;