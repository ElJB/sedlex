var rcConnector = require('../data/apiConnector/rcConnector.js'),
	assert = require('assert'),
	fs = require('fs');

var testedDebates = false;

assert(rcConnector.extractLawFromUrl.exec("http://www.lafabriquedelaloi.fr/api/ppl13-007/viz/interventions.json")[1]
	== "ppl13-007" );

rcConnector.loadTree(function(err, result){
	var lawId = result[0],
		debates = result[1];

	assert( !err );
	assert( debates instanceof rcConnector.Debates );
	if( lawId == 'ppl13-007' ){
		assert( typeof(lawId) == "string" );
		assert( typeof(debates.length) == "number" );
		assert( debates.getAudience(0) instanceof rcConnector.Audience );
		assert( typeof(debates.getAudience(0).length) == "number" );
		assert( debates.getAudience(0).getDivision(0) instanceof Object );
		testedDebates = true;
	}
});

fs.readFile('./example.json', function(err, data){
	var debates = new rcConnector.Debates(data);
	assert(debates.getAudience(0).getDivision(0).name == 'r&eacute;union du 16 juillet 2013 &agrave; 18h00');
	console.log(debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0));
	assert(debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0)
		== "http://www.nosdeputes.fr/14/seance/1733#inter_cf8223a560f25580ce772c783459d3e7");
})
