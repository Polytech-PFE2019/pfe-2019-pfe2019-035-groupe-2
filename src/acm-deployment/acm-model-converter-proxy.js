const URL = require('url').URL;
const http = require('http');

let nodeRedExporter = {
    fromModel: function (metamodel, callback) {
        callModelConverterServer("wimac", "nodered", metamodel, (convertedModel) => { let ret = JSON.parse(convertedModel); let retmodel = ret.ret; callback(retmodel, ret.mqttneeded) });
    }
};

let genesisExporter = {
    fromModel: function (metamodel, callback) {
        callModelConverterServer("wimac", "genesis", metamodel, (convertedModel) => { let retmodel = JSON.parse(convertedModel); callback(retmodel) });
    }
};

exports.nodeRedExporter = nodeRedExporter;
exports.genesisExporter = genesisExporter;

function callModelConverterServer(from, to, payload, callback) {
    let options = {
        hostname: 'localhost',
        port: 8010,
        path: '/converter/' + from + '/' + to,
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    };
    let req = http.request(options, function (res) {
        console.log("http request to model converter server in progress " + res.statusCode);

        // get data as its streamed by the server
        let buff = "";
        res.on("data", function (chunk) {
            buff += chunk;
        });

        // request finish start processing back
        res.on("end", function () {
            console.log("http request to model converter server complete " + res.statusCode);
            callback(buff);
        });
    });
    req.write(JSON.stringify(payload));
    req.end();
}