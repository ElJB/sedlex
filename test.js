var vpConnector = require('./data/apiConnector/vpConnector.js'),
	log = require('./log.js'),
	Set = require('simplesets').Set,
	htmlparser = require("htmlparser2");

var set = new Set();

vpConnector.getSummaries().then(function(entries){
	parser.write(entries[0].content);
	parser.end();
	
}).catch(log);
