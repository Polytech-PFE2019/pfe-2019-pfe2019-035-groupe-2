const http = require('http');
const URL = require('url').URL;
const querystring = require('querystring');

var exports = module.exports = {};

let url = null;

let prefix = "http://www.enact-project.eu/acm/";

exports.init = function (host, port, defaultpolicies, callback) {
    url = new URL("http://" + host + ":" + port);

    // check presence of acm dataset on jena instance
    let options = {
        path: "/$/datasets/acm-dataset",
        host: url.hostname,
        port: url.port,
        method: 'GET'
    };
    let req = http.request(options, function (res) {
        if (res.statusCode === 404) {
            // no dataset, create it and fill it with default values
            let dscreatebody = querystring.stringify({
                dbName: "acm-dataset",
                dbType: "tdb"
            });
            let dscreateopts = {
                path: "/$/datasets",
                host: url.hostname,
                port: url.port,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': dscreatebody.length
                }
            }
            let dscreatereq = http.request(dscreateopts, function (res) {
                if (res.statusCode === 200) {
                    // ds created ok, fill in values
                    defaultpolicies.forEach(exports.addPolicy);
                }
            });
            dscreatereq.write(dscreatebody);
            dscreatereq.end();
        }
        callback();
    });
    req.on("error", function (err) {
        callback(err);
    });
    req.end();
};

exports.getPolicies = function (callback) {
    // run sparql request
    let body = querystring.stringify({
        query: "PREFIX acm: <"+prefix+"> SELECT?subject WHERE { ?subject acm:acmtypeclass \"acm\"}"
    });
    let options = {
        path: "/acm-dataset/query",
        host: url.hostname,
        port: url.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': body.length,
            'Accept': "application/sparql-results+json,*/*;q=0.9"
        }
    };
    let req = http.request(options, function (res) {
        let response = "";
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            response += chunk;
        });
        res.on('end', () => {
            // we got a list of subject names for strats, run a query for each and get the rest of the data
            let strats = [];
            let ret = JSON.parse(response);
            let stratCount = ret.results.bindings.length;
            ret.results.bindings.forEach(resultbinding => {
                getPolicyByName(resultbinding.subject.value, strat => {
                    strats.push(strat);

                    // have to wait for end of all async reqs
                    if (!--stratCount) {
                        callback(JSON.stringify(strats));
                    }
                });
            });
        });

        if (res.statusCode !== 200) {
            callback("[]");
        }
    });
    req.write(body);
    req.end();
};

function getPolicyByName(name, callback) {
    let stratbody = querystring.stringify({
        query: "PREFIX acm: <" + prefix + "> SELECT ?p ?o WHERE { <" + name + "> ?p ?o }"
    });
    let stratoptions = {
        path: "/acm-dataset/query",
        host: url.hostname,
        port: url.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': stratbody.length,
            'Accept': "application/sparql-results+json,*/*;q=0.9"
        }
    };
    let stratreq = http.request(stratoptions, function (stratresobj) {
        let stratres = "";
        stratresobj.setEncoding('utf8');
        stratresobj.on('data', (chunk) => {
            stratres += chunk;
        });
        stratresobj.on('end', () => {
            // strat object
            let strat = {
                name: name.replace(prefix, ""),
                class: "class",
                description: "description",
                codeTemplate: "{}",
                type: "type",
                metadata: {}
            };

            // list of all the strat properties
            let props = JSON.parse(stratres);
            props.results.bindings.forEach(stratresbings => {
                // fill in the adequate one
                let propname = stratresbings.p.value.replace(prefix, "");
                switch (propname) {
                    case "stratClass":
                        strat.class = stratresbings.o.value;
                        break;
                    case "stratDescription":
                        strat.description = stratresbings.o.value;
                        break;
                    case "stratType":
                        strat.type = stratresbings.o.value;
                        break;
                    // skip non metadata props
                    case "stratCodeTemplate":
                    case "stratName":
                    case "acmtypeclass":
                        break;
                    default:
                        strat.metadata[propname] = stratresbings.o.value;
                        break;
                }
            });
            callback(strat);
        });
    });
    stratreq.write(stratbody);
    stratreq.end();
}

exports.addPolicy = function (policy, callback) {
    let sparql = "PREFIX acm:<" + prefix + ">\nINSERT DATA\n{\n";
    sparql += "acm:" + policy.name + " acm:acmtypeclass \"acm\" .\n";
    sparql += "acm:" + policy.name + " acm:stratName \"" + policy.name + "\" .\n";
    sparql += "acm:" + policy.name + " acm:stratClass \"" + policy.class + "\" .\n";
    sparql += "acm:" + policy.name + " acm:stratDescription \"" + policy.description + "\" .\n";
    sparql += "acm:" + policy.name + " acm:stratCodeTemplate \"" + /*querystring.encode(policy.codeTemplate)*/ {} + "\" .\n";
    sparql += "acm:" + policy.name + " acm:stratType \"" + policy.type + "\" .\n";
    Object.entries(policy.metadata).forEach(metadata => {
        sparql += "acm:" + policy.name + " acm:" + metadata[0] + " \"" + metadata[1] + "\" .\n";
    });
    sparql += "}";
    console.log(sparql);
    let dsfillbody = querystring.stringify({
        update: sparql
    });
    let dsfillopts = {
        path: "/acm-dataset/update",
        host: url.hostname,
        port: url.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': dsfillbody.length,
        }
    }
    let dsfillreq = http.request(dsfillopts, function (res) {
        console.log(res.statusCode);
    });
    dsfillreq.write(dsfillbody);
    dsfillreq.end();

    if (isFunc(callback)) {
        callback();
    }
};

// run a query
// query is an object can contain either a metadata property array or a sparql query
// for the sparql query we assume the good boys that get strats back have stratName in one of their variables
// metadata format "prop=val prop2=val2 prop3=val3...."
exports.queryPolicies = function (query, callback) {
    // sparql query
    if (query.sparql) {
        let stratbody = querystring.stringify({
            query: query.sparql
        });
        let stratoptions = {
            path: "/acm-dataset/query",
            host: url.hostname,
            port: url.port,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': stratbody.length,
                'Accept': "application/sparql-results+json,*/*;q=0.9"
            }
        };
        let stratreq = http.request(stratoptions, function (stratresobj) {
            let stratres = "";
            stratresobj.setEncoding('utf8');
            stratresobj.on('data', (chunk) => {
                stratres += chunk;
            });
            stratresobj.on('end', () => {
                try {
                    let result = JSON.parse(stratres);

                    // it's a good boy query with a stratName
                    // get the rest of the data
                    if (result.head.vars.indexOf("stratName") > -1) {
                        let strats = [];
                        let stratCount = result.results.bindings.length;
                        result.results.bindings.forEach(binding => {
                            getPolicyByName(binding.stratName.value, strat => {
                                strats.push(strat);

                                // have to wait for end of all async reqs
                                if (!--stratCount) {
                                    callback(JSON.stringify(strats));
                                }
                            });
                        });
                    } else {
                        // just return whatever we got back
                        callback(JSON.stringify(props.results));
                    }
                } catch (e) {
                    callback(JSON.stringify({ error: "probably invalid SPARQL" }));
                }
            });
        });
        stratreq.write(stratbody);
        stratreq.end();
    }

    // metadata
    if (query.metadata) {
        // build sparql query and call ourselves
        let sparqlquery = "PREFIX acm:<http://www.enact-project.eu/acm/> SELECT ?stratName WHERE {"
        query.metadata.split(" ").forEach(mp => {
            let mps = mp.split("=");
            sparqlquery += "?stratName acm:" + mps[0] + " \"" + mps[1] + "\"";
        });
        sparqlquery += "}";
        this.queryPolicies({ sparql: sparqlquery }, callback);
    }
}

// taken from underscore.js  https://stackoverflow.com/a/6000016
function isFunc(object) {
    return !!(object && object.constructor && object.call && object.apply);
}

exports.updatePolicy = function (id, newPolicy, callback) {

};

exports.deletePolicy = function (id) {

};