/*
Pulls data from regards citoyens folder through rc-debates module
Analyze speeches and builds opinions for each parliamentary group through approval module
Insert opinions in DB
*/

var	pg = require('../data/postgresHelper.js'),
	Q = require('q'),
	contract = require('../data/summaryContract.js').law,
	log = require('../log.js'),
	Debates = require("rc-debates"),
	approval = require('approval');

var buildOpinions = function(){
	return Q.promise(function(resolve, reject, notify){
		pg.queryPromise("SELECT nd_law_title, nd_folder_url FROM " + contract.tableName + " WHERE nd_folder_url IS NOT NULL LIMIT 1")
			.then(function(results){
				results.rows.forEach(function(result){
					var debates = new Debates(result.nd_folder_url, result.nd_law_title);

					debates.on("err", reject);
					debates.on("structured", function(){

						var orators = debates.getOratorsByGroup("UDI").each(function(orator){
							console.log("Opinion from " + orator + ", UDI");
							console.log("\n")
							var text = debates.getInterventionByOrator(orator);
							console.log(text);

							console.log("Selected sentences:\n");
							approval(text);

						});

					});
				});
			});
	});
	
}

buildOpinions()
	.then(function(){});
