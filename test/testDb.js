var pg = require('pg'),
	dbConnect = require('../res/settings.js').db,
	pg = require('../data/postgresHelper.js'),
	sourceContract = require('../data/summaryContract').source,
	assert = require('assert');
	Q = require('q');

sourceContract.tableName = "test_source";

pg.queryPromise(sourceContract.createDbString())
	.then(pg.chainQueryPromise(pg.buildSQLInsertString(sourceContract.tableName,
		sourceContract.getColumns(),
		["'This is not a summary'",
			"'http://www.notasummary.com'",
			"'llpp'",
			"'2000-01-01'",
			"2",
			"3000",
			"1",
			"'1erelecture'",
			"'assemblee'",
			"'true'"])))
	.then(pg.chainQueryPromise("SELECT * FROM " + sourceContract.tableName))
	.then(readTest)
	.then(pg.chainQueryPromise("DROP TABLE " + sourceContract.tableName))
	.then(function(result){
		console.log("testDb: OK");
	})
	.catch(function(err){
		console.log(err.stack);
	});

var readTest = function(result){
	assert(result.rowCount);
	return Q.promise(function(resolve, reject, notify){
		resolve(client);
	});
}