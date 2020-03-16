var ACMMetamodel = require("acm-metamodel");
var PhysicalProcess = ACMMetamodel.PhysicalProcess;
var Action = ACMMetamodel.Action;


var exports = module.exports = {};
exports.mergeModels = mergeModels;
exports.unmergeModels = unmergeModels;

function mergeModels(models, envModel, callback) {
    try {
        var physicalJSON = typeof envModel === "string" ? JSON.parse(envModel) : envModel;
        var physicalProcesses = [];


        for (var i = 0; i < physicalJSON.physical_processes.length; i++) {
            physicalProcesses.push(new PhysicalProcess(physicalJSON.physical_processes[i].id, physicalJSON.physical_processes[i].name, physicalJSON.physical_processes[i].x, physicalJSON.physical_processes[i].y));
        }
        for (i = 0; i < physicalJSON.links.length; i++) {
            for (var j = 0; j < models.components.length; j++) {
                if (models.components[j].id === physicalJSON.links[i].from_id) {
                    for (var k = 0; k < physicalProcesses.length; k++) {
                        if (physicalProcesses[k].id === physicalJSON.links[i].to_id) {
                            // there is a physical process for the component, create an Action
                            models.components[j] = new Action(models.components[j].id, models.components[j].name, models.components[j].x, models.components[j].y, models.components[j].type, models.components[j].id_parent);
                            models.components[j].physicalProcess.push(physicalProcesses[k]);
                        }
                    }
                }
            }
        }
        models.physicalProcess = physicalProcesses;
        callback(models);
    } catch (e) {
        console.error("ERROR merging models");
        console.error(e);
        callback(models);
    }
}

function unmergeModels(model, callback) {
    model.physicalProcess = [];
    model.components.forEach(cmp => delete (cmp.physicalProcess));
    callback(model);
}

