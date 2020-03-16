// initialize comm processing
let root = {
    registry: {},
    matchFunctions: {},
    generatorFunctions: {},
    identifyMatches: function (model) {
        for (let t in this.matchFunctions) {
            this.matchFunctions[t](model);
        }
    }
}

let NRComMMQTT = require("./NodeRedComm-MQTT");
NRComMMQTT.register(root.registry, root.matchFunctions, root.generatorFunctions);

let NRComWS = require("./NodeRedComm-WebSockets");
NRComWS.register(root.registry, root.matchFunctions, root.generatorFunctions);

module.exports = root;