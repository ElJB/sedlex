var rcConnector = require('./apiConnector/rcConnector.js'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	pg = require('./postgresHelper.js'),
	sourceContract = require('./summaryContract').source;

var dbPromise = pg.queryPromise("SELECT rcRef FROM source;");
rcConnector.loadTree(function(err, result){
	
})

	

