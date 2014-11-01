/*
Pulls data from regards citoyens folder through rc-debates module
Analyze speeches and builds opinions for each parliamentary group through approval module
Insert opinions in DB
*/

var	pgHelper = require('pg-helper'),
	Q = require('q'),
	contracts = require('../data/summaryContract.js'),
	log = require('../log.js'),
	Debates = require('rc-debates'),
	approval = require('approval');

var pg = new pgHelper({
	user: "boniface",
	database: "boniface",
	password: "blabla",
	host: "localhost"
});

var toDo = false;


//allow to restart the script halfway
var filterResults = function(sqlResult){
	return Q.promise(function(resolve, reject, notify){

		// sqlResult.rows = sqlResult.rows.filter(function(result){
		// 	// TODO: make stop point an argument in the script 
		// 	if( result.nd_folder_url == "http://www.nosdeputes.fr/14/dossier/8764"){
		// 		toDo = true;
		// 	}
		// 	return toDo;
		// });
		resolve(sqlResult);
	});
}

var fetchDebates = function(sqlResult){
	return Q.promise(function(resolve, reject, notify){

		var result = sqlResult.rows.splice(0, 1)[0];

		console.log(result.nd_folder_url);
		console.log(result.nd_law_title);
		var debates = new Debates(result.nd_folder_url, result.nd_law_title);

		debates.on("err", function(err){
			log(err);
			if( sqlResult.rows.length ){
				fetchDebates(sqlResult)
					.then(resolve);
			} else {
				resolve();
			}
		});
		debates.on("structured", function(debates){
			createLemmSentences(debates)
				.then(function(){
					if( sqlResult.rows.length ){
						fetchDebates(sqlResult)
							.then(resolve);
					} else {
						resolve();
					}
				}).catch(reject);
		});

	})
	
}

var createLemmSentences = function(debates){
	return Q.promise(function(resolve, reject, notify){

		console.log("Starting work on: " + debates.title);

		var groupList = Object.keys(debates.groups);

		var groupIterator = function(groupList){
			return Q.promise(function(resolve, reject, notify){
				var group = groupList.splice(0, 1)[0];

				console.log("Switch to group: " + group);

				oratorIterator(debates.getOratorsByGroup(group))
					.then(function(){
						if( groupList.length ){
							groupIterator(groupList)
								.then(resolve)
								.catch(reject);
						} else { resolve(); }
					}).catch(reject);
			});
			
		}

		var oratorIterator = function(orators){
			return Q.promise(function(resolve, reject, notify){
				var orator = orators.splice(0, 1)[0];

				console.log("Switch to orator: " + orator);

				var text = debates.getInterventionByOrator(orator);

				//TO DO: insert full text into DB speech

				approval(text)
					.then(insertCorpus)
					.catch(log)
					.fin(function(){
						if( orators.length ){ 
							oratorIterator(orators)
								.then(resolve)
								.catch(reject); 
						} else { resolve(); }
					});
			})
			
		}

		groupIterator(groupList).then(resolve);
	});

}

var insertCorpus = function(corpus){
	pg.startTransaction()
		.then(function(args){
			return Q.promise(function(resolve, reject, notify){
				var promises = [];

				corpus.forEach(function(entry){
					promises.push(pg.tQueryPromise(pg.buildSQLInsertString(
						contracts.corpus.tableName,
						contracts.corpus.getColumns(),
						[pg.dollarize(entry[0]),
						 pg.dollarize(entry[1]),
						 null,
						 null]))(args));
				});

				Q.all(promises)
					.then(function(){
						resolve(args);
					})
					.catch(reject);
			})
		}).then(pg.closeTransaction)
		.catch(log);
}

pg.queryPromise("SELECT nd_law_title, nd_folder_url FROM " + contracts.law.tableName + " WHERE nd_folder_url IS NOT NULL")
	.then(filterResults)
	.then(fetchDebates)
	.catch(log);
