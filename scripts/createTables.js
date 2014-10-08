var Q = require('Q'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	pg = require('../data/postgresHelper.js'),
	speechContract = require('../data/summaryContract').speech
	summaryContract = require('../data/summaryContract').summary;

var LOG = __filename + ": ";

var checkExist = function(result){
	return Q.promise(function(resolve, reject, notify){
		var existingSpeechTable = false,
			existingSummaryTable = false;
		result.rows.forEach(function(row){
			existingSpeechTable = existingSpeechTable ? true : row.table_name == speechContract.tableName;
			existingSummaryTable = existingSummaryTable ? true : row.table_name == summaryContract.tableName;
		});
		var promises = [];

		if( existingSpeechTable && existingSummaryTable ){
			return resolve();
		}
		if( !existingSpeechTable ){
			promises.push(pg.queryPromise(speechContract.createDbString()));
		}
		if( !existingSummaryTable ){
			promises.push(pg.queryPromise(summaryContract.createDbString()));
		}

		Q.all(promises)
			.then(function(results){
				resolve(results);
			}).catch(reject);
	});
}

var confirmCreation = function(results){
	if( results ){
		results.forEach(function(result){
			console.log(LOG + "Created table");
		});
	}
}

var createTables = function(){
	return Q.promise(function(resolve, reject, notify){
		pg.getTables()
			.then(checkExist)
			.then(confirmCreation)
			.then(function(){
				resolve();
			})
			.catch(reject);
	});
}

createTables().catch(log);

module.exports = createTables;