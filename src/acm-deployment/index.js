const http = require("http");
const URL = require('url').URL;

var converter = require("./acm-model-converter-proxy");

var exports = module.exports = {};

/*
exports.deployModels = deployModels;
function deployModels(models, callback) {
	var ret = [];
	var tocomplete = 0;
	for (var mdlidx in models) {
		var model = models[mdlidx];
		var state = {};

		switch (model.type) {
			case "node-red":
				tocomplete++;
				deploy_node_red.deployNodeRed(model, (deployRet) => {
					if (deployRet !== 0) {
						state = { failed: "deploy node red error code " + deployRet, ret: deployRet };
					} else {
						state = { success: "deploy node red OK", ret: deployRet };
					}
					ret.push({ id: model.id, state: state });
					tocomplete--;
					if (tocomplete === 0) callback(ret); 
				});
				break;
			default:
				state = { failed: "unknown model type " + model.type };
				ret.push({ id: model.id, state: state });
				tocomplete--;
				if (tocomplete === 0) callback(ret);
				break;
		}
	}
}*/

exports.deployOnline = deployOnline;
exports.deployDownload = deployDownload;


function deployOnline(metamodel, callback) {
    var model = metamodel.models;
    let modelType = model.acm_model_type || metamodel.acm_model_type
    switch (modelType) {
		case "nodered":
			/*var components = metamodel.components.filter(comp => comp.id_parent === model.id);
			var links = metamodel.links.filter(lnk => lnk.from.id_parent === model.id || lnk.to.id_parent === model.id);
			converter.nodeRedExporter.fromModel({ model, components, links }, callback);*/
			converter.nodeRedExporter.fromModel(metamodel, noderedPhase2(callback, model));
			break;
		case "genesis":
			converter.genesisExporter.fromModel(metamodel, genesisPhase2(callback));
			break;
		default: console.log("!!! deploymodel unknown model type " + model.acm_model_type);
			console.log(model);
	}
}

function deployDownload(metamodel, callback) {
	var model = metamodel.models;
	switch (model.acm_model_type) {
		case "nodered":
			converter.nodeRedExporter.fromModel(metamodel, callback);
			break;
		case "genesis":
			converter.genesisExporter.fromModel(metamodel, callback);
			break;
		default: console.log("!!! deploymodel unknown model type " + model.acm_model_type);
			console.log(model);
	}
}

function noderedPhase2(callback, model) {
    return function (newFlow) {
        try {
            model.nodes = newFlow.nodes;
            let data = JSON.stringify(model);
            if (model.url) {
                let url = new URL(model.url);

                // detect a flow UI url and replace it by an API url
                if (url.pathname === '/') {
                    let nodeRedFlowURL = model.url.replace("#", "");
                    console.log("nr flow url CORRECTED::" + nodeRedFlowURL);
                    url = new URL(nodeRedFlowURL);
                    // check if it's a valid flow url
                    if (!url.pathname.match(/(\/flow\/)[a-z0-9]+.[a-z0-9]+/)) {
                        callback({ error: "Node-Red deployment", message: "Please input an URL to a flow" });
                        return;
                    }
                }

                let options = {
                    path: url.pathname,
                    host: url.hostname,
                    port: url.port,
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        //"Content-Length": data.length
                    }
                };


                let req = http.request(options, function (httpIncomingMessage) {
                    var nodeRedFlowResponse = "";
                    httpIncomingMessage.setEncoding('utf8');
                    httpIncomingMessage.on('data', (chunk) => {
                        nodeRedFlowResponse += chunk;
                    });
                    httpIncomingMessage.on('end', () => {
                        console.log("response " + nodeRedFlowResponse);
                        callback({ success: "Node-Red deployment", message: "Deployment OK" });
                    });
                });
                req.on('error', (e) => {
                    console.log(e);
                    callback({ error: "Node-Red phase 2", message: e.message });
                });
                req.write(data);
                req.end();
            } else {
                callback({ error: "Node-Red deployment", message: "No URL to deploy to" });
                //console.log(model);
            }
        } catch (e) {
            callback({ error: "Node-Red deployment exception", message: e.message });
            //console.log(model);
        }
    }
}

function genesisPhase2(callback) {
    return function (model) {
        try {
            if (model.url) {
                console.log("deploy genesis to url " + model.url);
                var data = JSON.stringify(model);
                var url = new URL(model.url);
                var options = {
                    path: "/genesis/deploy",
                    host: url.hostname,
                    port: url.port,
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": data.length
                    }
                };
                var req = http.request(options, function (httpIncomingMessage) {
                    var genesisDeployResponse = "";
                    httpIncomingMessage.setEncoding('utf8');
                    httpIncomingMessage.on('data', (chunk) => {
                        genesisDeployResponse += chunk;
                    });
                    httpIncomingMessage.on('end', () => {
                        console.log("response " + genesisDeployResponse);
                    });
                });
                req.on('error', (e) => {
                    console.log(e);
                });
                req.write(data);
                req.end();
                callback({ success: "GeneSIS", message: "Genesis deployment ok" });
            } else {
                console.log("genesis model wasn't received from server, no attempt to deploy");
                callback({ error: "GeneSIS deployment", message: "No URL to deploy to" });
            }
        } catch (e) {
            callback({ error: "GeneSIS deployment exception", message: e.message });
            require("fs").writeFileSync("genesis.json", JSON.stringify(model));
        }
	};
}