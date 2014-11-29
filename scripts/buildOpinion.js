/*
Pulls data from regards citoyens folder through rc-debates module
Analyze speeches and builds opinions for each parliamentary group through approval module
Insert opinions in DB
*/

var	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	Q = require('q'),
	contract = require('../data/summaryContract.js'),
	log = require('../log.js'),
	Debates = require("rc-debates"),
	approval = require('approval');

var pg = new pgHelper(dbConnect);

var writeToDb = function(opinions, url){

	var opinion = opinions.splice(0, 1)[0];

	return Q.promise(function(resolve, reject, notify){
		pg.queryPromise(pg.buildSQLInsertString(
			contract.speech.tableName,
			contract.speech.getColumns(),
			[pg.dollarize(url),
			 pg.dollarize(opinion.text),
			 pg.dollarize(opinion.name),
			 pg.dollarize(opinion.group),
			 pg.dollarize(opinion.section)]))
			.then(function(){
				if( opinions.length ){
					writeToDb(opinions, url)
						.then(resolve)
						.catch(reject)
				} else {
					resolve();
				}
			})
			.catch(reject)
	});
}


var getFoldersUrl = function(){
	return Q.promise(function(resolve, reject, notify){
		pg.queryPromise("SELECT url, nd_law_title, nd_folder_url FROM " + contract.law.tableName + " WHERE nd_folder_url IS NOT NULL")
			.then(resolve)
			.catch(reject);
	});
};

var loadDebates = function(results){

	var result = results.rows.splice(0, 1)[0];

	var debates = new Debates(result.nd_folder_url, result.nd_law_title);

	debates.on("err", function(err){
		log(err);
		if( results.rows.length ){
			loadDebates(results);
		}
	});
	debates.on("structured", function(debates){
		writeToDb(debates.getOpinions(), result.url)
			.then(function(){
				if( results.rows.length ){
					loadDebates(results);
				}
			}).catch(log);
	});
}

getFoldersUrl()
	.then(loadDebates)
	.catch(log)
