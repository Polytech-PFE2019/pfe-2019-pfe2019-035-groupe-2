r = require('rethinkdb');

var exports = module.exports = {};

var connection = null;

exports.init = function (host, port, defaultpolicies, callback) {
    try {
        r.connect({ host: host, port: port }, function (err, conn) {
            if (err) callback(err);
            connection = conn;
            r.db("acm_repository").table("policies").run(connection, function (err, result) {
                if (err) {
                    if (err.msg.includes("does not exist")) {
                        r.dbCreate("acm_repository").run(connection, function (err, result) {
                            if (err) { callback(err); return; }
                            r.db("acm_repository").tableCreate("policies").run(connection, function (err, result) {
                                if (err) { callback(err); return }

                                // add default
                                for (var polidx in defaultpolicies) {
                                    exports.addPolicy(defaultpolicies[polidx], function (res) { });
                                }
                                callback(null);
                            });
                        });
                        
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null);
                }
            });
        });
    } catch (e){
        callback(e);
    }
};

exports.getPolicies = function (callback) {
	r.db("acm_repository").table("policies").run(connection, function (err, cursor) {
		if (err) throw err;
		cursor.toArray(function (err, result) {
			if (err) throw err;
			callback(JSON.stringify(result, null, 2));
		});
	});
};

exports.addPolicy = function (newPolicy, callback) {
	r.db("acm_repository").table("policies").insert(newPolicy).run(connection, function (err, result) {
		if (err) throw err;
		callback(JSON.stringify(result, null, 2));
	});
};

exports.updatePolicy = function(id, newPolicy, callback){
	r.db("acm_repository").table("policies").filter({ id: id }).update(newPolicy).run(connection, function (err, result) {
		if (err) throw err;
		callback(JSON.stringify(result, null, 2));
	});
};

exports.deletePolicy = function (id) {
	r.db("acm_repository").table("policies").filter({ id: id }).delete().run(connection, function (err, result) {
		if (err) throw err;
		callback(JSON.stringify(result, null, 2));
	});
};

exports.queryPolicies = function (query, callback) {
    callback(2);
}