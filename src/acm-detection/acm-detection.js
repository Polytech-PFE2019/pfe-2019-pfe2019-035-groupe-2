var exports = module.exports = {};
const http = require('http');

exports.findActuationConflictsInModel = function (model, callback) {
    fromMetamodel(model, function (data) {
        let options = {
            hostname: 'localhost',
            port: 8007,
            path: '/findConflicts',
            method: 'POST'
        };
        let req = http.request(options, function (res) {
            console.log("http request to agg in progress " + res.statusCode);

            // get data as its streamed by the server
            let buff = "";
            res.on("data", function (chunk) {
                buff += chunk;
            });

            // request finish start processing back
            res.on("end", function () {
                console.log("http request to agg complete " + res.statusCode);
                toMetamodel(buff, model, function (mmret) {
                    callback(mmret);
                });
            });
        });
        req.write(data);
        req.end();
    });
}; 

function fromMetamodel(model, callback) {
    callModelConverterServer("wimac", "agg", { wimac: model }, callback);
}

function toMetamodel(agg, model, callback) {
    callModelConverterServer("agg", "wimac", { wimac: model, agg: agg }, (data) => {
        data = JSON.parse(data);
        data.physicalProcess = model.physicalProcess;
        data.url = model.url;

        // fix link ordering
        // otherwise heterogeneous outputs can get mangled
        let newlinks = [], sortedlinkarray = [], sortedlinks = [];
        for (let lnkidx in data.links) {
            let lnk = data.links[lnkidx];
            let index = -1;
            if (lnk.x === 0 && lnk.y === 0) {
                // new link, just match one of the sides
                index = model.links.findIndex((modellnk, idx) => { return (modellnk.from.id === lnk.from.id || modellnk.to.id === lnk.to.id) });
                //console.log(lnk.x + ":" + lnk.y + ":: " + index);
            } else {
                // existing link, match both ends
                index = model.links.findIndex(modellnk => modellnk.from.id === lnk.from.id && modellnk.to.id === lnk.to.id);
            }
            if (index === -1) {
                //console.log("not ordering new link");
                //console.log(lnk);
                newlinks.push(lnk);
            } else {
                //console.log("index " + index);
                if (!sortedlinkarray[index]) sortedlinkarray[index] = [];
                sortedlinkarray[index].push(lnk);
            }
        }
        // remove empty spots
        sortedlinkarray = sortedlinkarray.filter(lnk => lnk !== undefined);
        sortedlinkarray.forEach(arr => sortedlinks.push(...arr));
        // add new links
        sortedlinks.push(...newlinks);

        data.links = sortedlinks;

        callback(data);
    });
}

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