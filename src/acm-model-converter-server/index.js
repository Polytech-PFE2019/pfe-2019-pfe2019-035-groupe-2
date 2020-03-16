const mcs = require("./model-converter-server");

let express = require("express");
let app = express();
app.set("port", 8010);
// enable json body
app.use(express.json({ limit: '10mb' }));
// enable generic body

// start server
let server = app.listen(app.get('port'), function () {
	var port = server.address().port;
	console.log('ACM Model Converter server started on ' + port);
});

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(JSON.stringify({ error: "Likely a parsing error" }));
});

app.post("/converter/:src/:dst", mcs.convert); 