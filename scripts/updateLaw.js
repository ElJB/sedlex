var Q = require('Q'),
	connector = require('vie-publique'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	contract = require('../data/summaryContract').law,
	util = require('util');

var pg = new pgHelper(dbConnect);

var temp_contract = {};
for( key in contract ){
	temp_contract[key] = contract[key];
}
temp_contract.tableName = contract.tableName + "_temp";
var columns = contract.getColumns();

var insertTempSummaries = function(summaries){
	return function(args){
		return Q.promise(function(resolve, reject, notify){

			var insertBatch = function(summaries){

				var insertPromises = [];

				summaries.splice(0,10).forEach(function(summary){
					var data = [];

					for( i in columns ){
						data[columns[i]] = summary[columns[i]];
						if( data[columns[i]] === undefined ){ data[columns[i]] = null; };
						if( typeof(data[columns[i]]) == "string" ){ data[columns[i]] = pg.dollarize(data[columns[i]]); };
						if( util.isArray(data[columns[i]]) ){ data[columns[i]] = pg.dollarize(JSON.stringify(data[columns[i]])); };
					}

					insertPromises.push(pg.tQueryPromise(pg.buildSQLInsertString(
						temp_contract.tableName,
						columns,
						data))(args));
				});

				Q.all(insertPromises)
					.then(function(){
						debug("Remains to insert: " + summaries.length);
						if( !summaries.length ){ return resolve(args); }
						insertBatch(summaries);
					}).catch(reject);			
			}

			insertBatch(summaries);
		});		
	}
}

var updateExistingEntries = function(){
	var setSyntax = "";
	for( i in columns ){
		setSyntax += columns[i] + " = " + temp_contract.tableName + "." + columns[i] + ", ";
	}
	setSyntax = setSyntax.substring(0, setSyntax.length - 2);

	var queryString = "UPDATE " + contract.tableName +
		" SET " + setSyntax +
		" FROM " + temp_contract.tableName +
		" WHERE " + contract.tableName + ".url = " + temp_contract.tableName + ".url";

	return pg.tQueryPromise(queryString);
}

var insertNonExistingEntries = function(){
	var selectSyntax = columns.map(function(column){ return temp_contract.tableName + "." + column; }).toString();

	var queryString = "INSERT INTO " + contract.tableName + " (" + contract.getColumns().toString() + ") " +
		" SELECT " + selectSyntax +
		" FROM " + temp_contract.tableName +
		" LEFT OUTER JOIN " + contract.tableName + " ON (" + contract.tableName + ".url = " +
			temp_contract.tableName + ".url)" +
		" WHERE " + contract.tableName + ".url IS NULL";

	return pg.tQueryPromise(queryString);
}

//TODO: refactor UPSERT procedure inside pgHelper

var promises = [];

promises.push(pg.queryPromise("SELECT max(date) FROM " + contract.tableName));
promises.push(connector.getSummaries());

Q.all(promises)
	.then(function(results){
		var maxDate = results[0],
			summaries = results[1];

		if( maxDate = maxDate.rows[0].max ){
			summaries = summaries.filter(function(summary){
				return new Date(summary.date) >= new Date(maxDate);
			});
		}
		
		pg.startTransaction()
			.then(pg.tQueryPromise(temp_contract.createDbString()))
			.then(insertTempSummaries(summaries))
			.then(pg.tQueryPromise("LOCK TABLE " + temp_contract.tableName + " IN EXCLUSIVE MODE"))
			.then(updateExistingEntries())
			.then(insertNonExistingEntries())
			.then(pg.tQueryPromise("DROP TABLE " + temp_contract.tableName))
			.then(pg.closeTransaction)
			.catch(log);

	}).catch(log);