/**
 * from genesis to pivot model
 **/
const fs = require("fs");
const util = require('util');
const http = require("http");
const URL = require('url').URL;
const acm_metamodel = require("acm-metamodel");

var Metamodel = acm_metamodel.Metamodel;
var Communication = acm_metamodel.CommunicationComponent;

var exports = module.exports = {};

var nodeRedConverter = require("./from-nodered.js");
var thingMLConverter = require("./from-thingml.js");

exports.fromURL = function (genesisUrl, callback) {
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
			exports.fromString(genesisResponse, callback, genesisUrl);
		});
	});
	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});
	req.end();
};

exports.fromString = function (genesisDMStr, callback, url) {
	try {
		var flow = JSON.parse(genesisDMStr);
	} catch (e) {
		console.log("unable to parse json " + genesisDMStr);
		return;
	}
	return exports.fromJSON(flow, callback, url);
};

exports.fromJSON = function (genesis, callback, url) {
	var metamodel = [];
	var components = [];
	var links = [];
	// to get rid of

	for (var cmpidx in genesis.dm.components) {
		var cmp = genesis.dm.components[cmpidx];
		console.log("j'arrive ici")
        switch (cmp._type) {
            case "/internal/node_red_flow":
			case "/internal/node_red":
				var host = getHostIP(genesis.dm.components, cmp.id_host);

				// get flow
				let flow = cmp.nr_flow;
				if (cmp.path_flow && cmp.path_flow !== "") {
					// read from file
                    try {
						flow = JSON.parse(fs.readFileSync(cmp.path_flow));

						// copy file flow to nr_flow, and remove it
						// output with acm will be put in nr_flow, file untouched
						cmp.nr_flow = flow;
						cmp.path_flow = "";
					} catch (e) { console.log("error reading path_flow " + cmp.path_flow + "::" + e); }
				}

				nodeRedConverter.fromJSON(flow, function (m) {
					components.push(m.components);
					links.push(m.links);
				}, "http://" + host + ":" + cmp.port);

				// node red flow from file
				
				break;
			case "/internal/thingml":
				//TO DO
				console.log("j'arrive là")
				var host = getHostIP(genesis.dm.components, cmp.id_host);


				thingMLConverter.fromFilePath(cmp.file,"B:/Ali/PFE","B:/Ali/PFE/Unzipped", function (m) {
					components.push(m.components);
					links.push(m.links);
				});
				break;
			default: break;
		}
	}

	// many nodejs versions don't have flat, including the two we say we support on the readme
	if (!Array.prototype.flat) {
		Object.defineProperty(Array.prototype, 'flat', {
			value: function (depth = 1) {
				return this.reduce(function (flat, toFlatten) {
					return flat.concat((Array.isArray(toFlatten) && (depth - 1)) ? toFlatten.flat(depth - 1) : toFlatten);
				}, []);
			}
		});
	}

	components = components.flat();
	links = links.flat();
    genesis.acm_model_type = "genesis";
    genesis.url = url;
	var new_model = new Metamodel(components, links, genesis);
	
	//flattenMetamodel(new_model);
	//console.log(new_model)

	callback(new_model);

};

function getHostIP(components, id) {
	for (var cmpidx in components) {
		if (components[cmpidx].name === id) {
			return components[cmpidx].ip;
		}
	}
	return null;
}


/*function flattenMetamodel(metamodel, callback) {
	var Link = require("../acm-metamodel/Link.js");
	
	components = metamodel.components;
	links = metamodel.links;

	for (var i = 0; i < components.length; i++) {

		if(components[i] instanceof Communication){
			for (var j = i+1; j < components.length; j++) {
				if(Object.getPrototypeOf(components[i]) == Object.getPrototypeOf(components[j])){
					components[i].match(components[j],metamodel);
				}
			}			
		}

	}
}*/