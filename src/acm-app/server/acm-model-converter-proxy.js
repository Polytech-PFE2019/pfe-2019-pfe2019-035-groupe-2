const URL = require('url').URL;
const http = require('http');

let nodeRedConverter = {
    fromJSON: function (nodeRedFlow, callback, url) {
        //acm_model_converter.nodeRedConverter.fromJSON(nodeRedFlow, callback, url);
        callModelConverterServer("nodered", "wimac", nodeRedFlow, noderedcallback(url, callback));
    },
    fromURL: function (nodeRedFlowURL, callback, url) {
        callModelConverterServer("noderedurl", "wimac", { path: nodeRedFlowURL }, noderedcallback(nodeRedFlowURL, callback));
        //acm_model_converter.nodeRedConverter.fromURL(nodeRedFlowURL, callback, url);
        /*console.log("nr flow url::" + nodeRedFlowURL);
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
                callModelConverterServer("nodered", "wimac", JSON.parse(nodeRedFlowResponse), noderedcallback(url, callback));
            });
        });
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        req.end();*/
    }
};

function noderedcallback(url, callback){
    return function (convertedModel) {
        let retmodel = JSON.parse(convertedModel);
        if (retmodel.error) {
            console.log("Error in NR JSON conversion");
            console.log(retmodel.error);
            callback({});
        } else {
            retmodel.models.url = url;
            retmodel.models.acm_model_type = "nodered";
            callback(retmodel);
        }
    }
}

let genesisConverter = {
    fromJSON: function (genesis, callback, url) {
        //acm_model_converter.genesisConverter.fromJSON(genesis, callback, url);
        callModelConverterServer("genesis", "wimac", genesis, genesiscallback(url, callback));
    },
    fromURL: function (genesisUrl, callback) {
        //acm_model_converter.genesisConverter.fromURL(genesisUrl, callback);
        console.log("genesis url::" + genesisUrl);
        let url = new URL(genesisUrl);
        var options = {
            // here we use model_ui because that's what genesis exports, and starts with a dm/graph node
            // todo maybe work on non ui models?
            path: "/genesis/model_ui",
            host: url.hostname,
            port: url.port,
            method: 'GET'
        };
        var req = http.request(options, function (httpIncomingMessage) {
            var genesisResponse = "";
            httpIncomingMessage.setEncoding('utf8');
            httpIncomingMessage.on('data', (chunk) => {
                genesisResponse += chunk;
            });
            httpIncomingMessage.on('end', () => {
                callModelConverterServer("genesis", "wimac", JSON.parse(genesisResponse), genesiscallback(url, callback));
            });
        });
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        req.end();
    }
};

function genesiscallback(url, callback) {
    return function (convertedModel) {
        try {
            let retmodel = JSON.parse(convertedModel);
            retmodel.models.url = url;
            retmodel.models.acm_model_type = "genesis";
            callback(retmodel);
        } catch (e) {
            console.log("Error in genesiscallback");
            console.log(e.message);
            console.log(convertedModel);
            callback({});
        }
    }
}

exports.nodeRedConverter = nodeRedConverter;
exports.genesisConverter = genesisConverter;

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