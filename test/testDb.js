var pg = require('pg'),
	dbConnect = require('../res/settings.js').db,
	pg = require('../data/postgresHelper.js'),
	summaryContract = require('../data/summaryContract'),
	assert = require('assert');
	Q = require('q');

var testTableName = "test_summarize";

var sqlCreateSummarizeTable = pg.sqlCreateSummarizeTableString(testTableName);

pg.clientPromise
	.then(pg.promiseQueryBuilder(sqlCreateSummarizeTable))
	.then(pg.promiseQueryBuilder(pg.buildSQLInsertString(testTableName,
		[summaryContract.colSourceText,
			summaryContract.colUrl,
			summaryContract.colSummary],
		["'This is not a summary'",
			"'http://www.notasummary.com'",
			"'this != summary'"])))
	.then(pg.promiseQueryBuilder("SELECT * FROM " + testTableName))
	.then(readTest)
	.then(pg.promiseQueryBuilder("DROP TABLE " + testTableName))
	.catch(function(err){
		console.log(err);
	});

var readTest = function(client, result){
	assert(result.rowCount);
	return Q.promise(function(resolve, reject, notify){
		resolve(client);
	});
}