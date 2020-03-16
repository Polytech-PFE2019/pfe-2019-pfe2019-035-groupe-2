var acm_metamodel = require("acm-metamodel");

var ACMComponent = acm_metamodel.ACMComponent;
var Link = acm_metamodel.Link;


const crypto = require('crypto');

var exports = module.exports = {};
exports.instantiateACM = instantiateACM;
exports.instantiateMonitor = instantiateMonitor;

function instantiateMonitor(component) {
	// architecturally correct but a bit useless
	return component;
}

function instantiateACM(model, component/*, isFirstCall=true*/) {
    // treat indirect conflicts (multiple acms)
	/*console.log("idconf" + component.id_conflict);
	if (isFirstCall && component.id_conflict) {
		var ret = {
			acm: [],
			components: [],
			links: []
		};

		model.components.forEach(function (cmp) {
			if (cmp.id_conflict === component.id_conflict) {
				var w = instantiateACM(model, cmp, false);
				ret.acm.push(...w.acm);
				ret.components.push(...w.components);
				ret.links.push(...w.links);
			}
		});

		return ret;
	} else {*/
    let taggingNodesToGenerate = [];
    model.links.forEach(function (link) {
        if (link.to.id === component.id) {
            var tagNodeData = {};
            tagNodeData.id = component.id + "-tag-" + link.from.id;

            // get coordinates of app node to place tagging node alongside
            var node = getNode(link.from.id, model.components);
            tagNodeData.x = node.x + 80;
            tagNodeData.y = node.y;
            tagNodeData.tag = link.from.id;
            taggingNodesToGenerate.push(tagNodeData);
        }
    });

    // generate all the nodes
    return synthesizeACM(component, taggingNodesToGenerate);
    //}
}


function synthesizeACM(component, taggingNodesToGenerate) {
	var retnodes = [], retlinks = [];

	// generate the sync node
	var syncNode = new ACMComponent(component.id + "_sync", "ACM Sync"/* " + component.id*/, component.x - 80, component.y, acm_metamodel.ACMSyncType, component.id_parent, "sync", taggingNodesToGenerate, true);
	retnodes.push(syncNode);

	// generate the tagging nodes
	for (var nodeindex = 0; nodeindex < taggingNodesToGenerate.length; nodeindex++) {
		var taggingNode = new ACMComponent(taggingNodesToGenerate[nodeindex].id, "ACM tag"/* " + taggingNodesToGenerate[nodeindex].tag*/, taggingNodesToGenerate[nodeindex].x, taggingNodesToGenerate[nodeindex].y, acm_metamodel.ACMTagType, component.id_parent, "tag", taggingNodesToGenerate[nodeindex].tag, true);
		retnodes.push(taggingNode);

		// generate link from tag to sync
		var syncLink = new Link(taggingNode.id + ":" + component.id, "", 0, 0, taggingNode, syncNode);
		retlinks.push(syncLink);
	}

	// generate link from sync to ACM
	var acmLink = new Link(component.id + "_sync", "", 0, 0, syncNode, component);
	retlinks.push(acmLink);

	return {
		acm: component,
		components: retnodes,
		links: retlinks
	};
}

function getNode(nodeID, nodes) {
	for (var nidx in nodes) {
		if (nodes[nidx].id === nodeID) return nodes[nidx];
	}
}

function generateNRID() {
	return "ACM_" + generateID(8) + "." + generateID(6);
}

// generate hex id https://stackoverflow.com/a/27747377
// dec2hex :: Integer -> String
function dec2hex(dec) {
	return ('0' + dec.toString(16)).substr(-2);
}

// generateId :: Integer -> String
function generateID(len) {
	var arr = new Uint8Array((len || 40) / 2);
	crypto.randomFillSync(arr);
	return Array.from(arr, dec2hex).join('');
}
