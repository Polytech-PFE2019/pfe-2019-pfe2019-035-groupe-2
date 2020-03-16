const converter = require("acm-model-converter");
const ProcessingTypeRegistry = converter.DynamicProcessingTypeRegistry;
const acm_metamodel = require("acm-metamodel");

let inputFunctions = {
    wimac: inputMetamodel,
    agg: inputAgg,
    genesis: inputGenesis,
    nodered: inputNodeRed,
    noderedurl: inputNodeRedUrl
};

let outputFunctions = {
    wimac: outputMetamodel,
    agg: outputAgg,
    genesis: outputGenesis,
    nodered: outputNodeRed
};

function convert(req, res) {
    let src = req.params.src, dst = req.params.dst;
    console.log(src + "=>" + dst);

    if (!inputFunctions[src]) {
        res.type("application/json");
        res.end(JSON.stringify({ error: "input format not recognized" }));
    }
    if (!outputFunctions[dst]) {
        res.type("application/json");
        res.end(JSON.stringify({ error: "output format not recognized" }));
    }

    try {
        inputFunctions[src](req.body, (internalModel) => {
            outputFunctions[dst](internalModel, (outputPayload, MIMEtype) => {
                res.type(MIMEtype ? MIMEtype : "application/json");
                res.end(outputPayload);
            });
        });
    } catch (e) {
        res.end(JSON.stringify({ error: "error converting model: " + e.message }));
        console.log("error in model converter server:");
        console.log(e.message);
        console.error(e.stack);
    }
};

var exports = module.exports = {};
exports.convert = convert;

// WIMAC
function outputMetamodel(internalModel, callback) {;
    ProcessingTypeRegistry.identifyMatches(internalModel);
    callback(JSON.stringify(internalModel), "application/json");
}

function inputMetamodel(body, callback) {
    let internalModel;
    if (body.wimac) {
        internalModel = acm_metamodel.rebuildMetamodel(body.wimac);
    } else {
        internalModel = acm_metamodel.rebuildMetamodel(body);
    }
    delete internalModel.physicalProcess;
    delete internalModel.url;
    callback(internalModel);
}

// AGG
function outputAgg(internalModel, callback) {
    converter.ggxconverter.fromMetamodel(internalModel, (ret) => {
        callback(ret, "application/xml");
    });
}

function inputAgg(body, callback) {
    converter.ggxconverter.toMetamodel(body.agg, body.wimac, (ret) => {
        callback(ret);
    });
}

// GeneSIS
function inputGenesis(body, callback) {
    converter.genesisConverter.fromJSON(body, (ret) => {
        callback(ret);
    });
}

function outputGenesis(internalModel, callback) {
    converter.genesisExporter.fromModel(internalModel, (ret) => {
        callback(JSON.stringify(ret));
    });
}

// NodeRED
function inputNodeRed(body, callback) {
    converter.nodeRedConverter.fromJSON(body, (ret) => {
        callback(ret);
    });
}

function inputNodeRedUrl(body, callback) {
    converter.nodeRedConverter.fromURL(body.path, (ret) => {
        callback(ret);
    });
}

function outputNodeRed(internalModel, callback) {
    converter.nodeRedExporter.fromModel(internalModel, (ret, mqttneeded) => {
        callback(JSON.stringify({ ret: ret, mqttneeded: mqttneeded }));
    });
}

//ThingML
function inputThingML(body, callback) {
    converter.t
}