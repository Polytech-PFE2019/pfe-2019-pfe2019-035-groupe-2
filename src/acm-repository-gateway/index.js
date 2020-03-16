let rethinkdb = require("./rethinkdb");
let jena = require("./jena-fuseki");

// select repo to query
//let repo = jena;
// 3030 jena 28015 rethinkdb
//let port = 3030;

let repo = rethinkdb;
let port = 28015;

let host = "localhost";

// list of default policies to load in db
let defaultpolicies = [
    {
        "type": "node-red",
        "name": "OR",
        "class": "Logic",
        "metadata": {physicalProcessType: "generic", inputType: "boolean"},
        "codeTemplate": "{}",
        "description": "Logic OR between inputs"
    },
    {
        "type": "node-red",
        "name": "AND",
        "class": "Logic",
        "metadata": { physicalProcessType: "generic", inputType: "boolean" },
        "codeTemplate": "{}",
        "description": "Logic AND between inputs"
    },
    {
        "type": "node-red",
        "name": "Average",
        "class": "Math",
        "metadata": { physicalProcessType: "generic", inputType: "number" },
        "codeTemplate": "{}",
        "description": "Average between inputs"
    },
    {
        "type": "node-red",
        "name": "Min",
        "class": "Math",
        "metadata": { physicalProcessType: "generic", inputType: "number" },
        "codeTemplate": "{}",
        "description": "Min of inputs"
    },
    {
        "type": "node-red",
        "name": "Max",
        "class": "Math",
        "metadata": { physicalProcessType: "generic", inputType: "number" },
        "codeTemplate": "{}",
        "description": "Max of inputs"
    },
    {
        "type": "node-red",
        "name": "Random",
        "class": "Misc",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "Random input"
    },
    {
        "type": "node-red",
        "name": "Light",
        "class": "Light",
        "metadata": { physicalProcessType: "light", inputType: "boolean" },
        "codeTemplate": "{}",
        "description": "Toggle for lights system"
    },
    {
        "type": "node-red",
        "name": "LightRGB",
        "class": "Light",
        "metadata": { physicalProcessType: "light", inputType: "grovergb" },
        "codeTemplate": "{}",
        "description": "Toggle for lights system, RGB LED variant"
    },
    {
        "type": "node-red",
        "name": "FSM",
        "class": "FSM",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "FSM SCXML based behaviour"
    }, {
        "type": "node-red",
        "name": "SocketBefore",
        "class": "Demo",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "Socket must be turned on before the light"
    }, {
        "type": "node-red",
        "name": "PassThrough",
        "class": "Generic",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "Inputs are passed through to the output"
    }, {
        "type": "node-red",
        "name": "incColor",
        "class": "Generic",
        "metadata": { physicalProcessType: "light", inputType: "number" },
        "codeTemplate": "{}",
        "description": "honestly i have no idea"
    }, {
        "type": "node-red",
        "name": "onOffIncColor",
        "class": "Generic",
        "metadata": { physicalProcessType: "light", inputType: "number" },
        "codeTemplate": "{}",
        "description": "honestly i have no idea"
    }, {
        "type": "node-red",
        "name": "Broadcast",
        "class": "Generic",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "Broadcasts the first input it receives to all outs"
    }, {
        "type": "node-red",
        "name": "SodiumColor",
        "class": "Generic",
        "metadata": { physicalProcessType: "generic", inputType: "generic" },
        "codeTemplate": "{}",
        "description": "Broadcasts the first input it receives to all outs"
    }
	/*{
		"type": "node-red",
		"name": "ECA",
		"class": "Rules",
		"metadata": "<owl></owl>",
		"codeTemplate": "{\"name\":\"ACM ECA\", \"type\":\"function\", \"func\":\"var state = context.get(\\\"acm-eca-state\\\") || false;\\nmsg.payload = !state;\\ncontext.set(\\\"acm-eca-state\\\",!state);\\nreturn msg;\\n\"}",
		"description": "ECA Rules",
		"configuration": {
			"name": "ECA Rules",
			"description": "Rules for the ECA model",
			"codeVar": "rules",
			"value": ""
		}
	}*/
];

// init it
if (repo) {
    repo.init(host, port, defaultpolicies, init_callback);

    let exports = module.exports = {};

    function init_callback(err) {
        exports.init = repo.init;
        exports.getPolicies = repo.getPolicies;
        exports.addPolicy = repo.addPolicy;
        exports.updatePolicy = repo.updatePolicy;
        exports.deletePolicy = repo.deletePolicy;
        exports.queryPolicies = repo.queryPolicies;
        
        if (err) {
            console.log("init error\n" + err);
            exports.repoStatus = { online: false, error: err };
        } else {
            exports.repoStatus = { online: true };
        }
    }
}