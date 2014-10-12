var connector = require('../data/apiConnector/ndConnector.js'),
	assert = require('assert');


connector.getProjects()
	.then(function(projects){
		assert(projects.length);
		return;	
	}).then(function(){
		console.log("test ndConnector: OK")
	}).catch(function(err){
		assert(!err);
	});