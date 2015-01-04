var express = require('express')
	, app = express()
	, compression = require('compression')
	, server = require('http').createServer(app);

app.use(compression({}));

app.get('/law', function(req, res){
	res.send("Request received");
});

app.get('/law/*', function(req, res){
	res.send("Request received");
});

/*
Server starting to listen
*/

console.log(process.env.MYPORT);

var port = process.env.MYPORT || 5000;
server.listen(port, function() {
	console.log("Listening on " + port);
});