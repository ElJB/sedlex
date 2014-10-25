/*
Understand Fabrique de la loi Audience classification
by loading all descriptors in a set
*/

var Q = require('Q'),
	rcConnector = require('../data/apiConnector/rcConnector.js'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	speechContract = require('../data/summaryContract').speech
	Set = require('simplesets').Set;

var pg = new pgHelper(dbConnect);

var audienceSet = new Set(),
	promises = [];

var buildAudienceSet = function(result){
	var lawId = result[0],
			debates = result[1];
	return Q.promise(function(resolve, reject, notify){
		for( i = 0; i < debates.length; i++ ){
			audienceSet.add(debates.getAudience(i).name);
		}
		resolve();
	});
};


var loadInterventions = function(projects){
	return Q.promise(function(resolve, reject, notify){
		projects.forEach(function(project){

			var promise = rcConnector.loadIntervention(project)
				.then(buildAudienceSet)
				.catch(log);

			promises.push(promise);
		});

		resolve();
	});
}

var publishResult = function(){
	Q.all(promises).then(function(){
		console.log(audienceSet);
	});
}

rcConnector.loadProjects()
	.then(loadInterventions)
	.then(publishResult)
	.catch(log)
	.done();
