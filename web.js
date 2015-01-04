var express = require('express')
	, app = express()
	, compression = require('compression')
	, server = require('http').createServer(app)
	, contract = require('./data/contract.js');

app.use(compression({}));

app.get('/law', function(req, res){
	contract.findAllLawsUntil(new Date(2010,0,0))
	.then(function(results){
		res.send(results[0]);
	}).catch(log);
});

app.get('/law/:id', function(req, res){
	contract.findLawById(req.params.id)
	.then(function(results){
		res.send(results[0]);
	}).catch(log);
});

/*
Server starting to listen
*/

var port = process.env.PORT || 5000;
server.listen(port, function() {
	console.log("Listening on " + port);
});

function log(e){
	console.log(e.stack);
}