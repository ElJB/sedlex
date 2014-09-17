var pg = require('pg'),
	dbConnect = require('../res/settings.js').db,
	pg = require('../data/postgresHelper.js'),
	summaryContract = require('../data/summaryContract'),
	Q = require('q');

var readDeffered = Q.defer(),
	testTableName = "test_summarize";

var sqlCreateSummarizeTable = sqlCreateSummarizeTableQuery(testTableName);

pg.clientPromise.then(pg.promiseQueryBuilder("DROP TABLE " + testTableName))
	.then(pg.promiseQueryBuilder(sqlCreateSummarizeTable))
	.then(pg.promiseQueryBuilder("SELECT * FROM " + testTableName, resultDeffered))
	.catch(function(err){
		console.log(err);
	});

resultDeffered.promise.then(function(result){
	console.log("bla");
}, function(err){
	console.log(err);
}).done();