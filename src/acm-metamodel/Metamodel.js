var ACMElement = require("./ACMElement.js");


class Metamodel{
    constructor(components,links, models,physicalProcess=[]) {   
        this.components = components;
		this.links = links;
        this.models = models;
		this.physicalProcess = physicalProcess;
    }
}

module.exports = Metamodel;
