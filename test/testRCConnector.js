var rcConnector = require('../data/apiConnector/rcConnector.js'),
	assert = require('assert'),
	fs = require('fs');

var testedDebates = false;

assert(rcConnector.extractLawFromUrl.exec("http://www.lafabriquedelaloi.fr/api/ppl13-007/viz/interventions.json")[1]
	== "ppl13-007" );

rcConnector.loadProjects()
	.then(function(projects){
		assert(projects.length > 250);
	}).catch(function(err){
		assert(err === null);
	});

rcConnector.loadIntervention('ppl13-007')
	.then(function(result){
		var lawId = result[0],
		debates = result[1];

		assert( debates instanceof rcConnector.Debates );
		assert( typeof(lawId) == "string" );
		assert( typeof(debates.length) == "number" );
		assert( debates.getAudience(0) instanceof rcConnector.Audience );
		assert( typeof(debates.getAudience(0).length) == "number" );
		assert( debates.getAudience(0).getDivision(0) instanceof Object );
	}).catch(function(err){
		assert(err === null);
	});

fs.readFile('./example.json', function(err, data){
	var debates = new rcConnector.Debates(data);
	assert(debates.getAudience(0).getDivision(0).name == 'r&eacute;union du 16 juillet 2013 &agrave; 18h00');
	console.log(debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0));
	assert(debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0).name
		== "jean-marc germain");
});
