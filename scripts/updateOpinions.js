var ndConnector = require('../data/apiConnector/ndConnector.js'),
	pg = require('../data/postgresHelper.js'),
	Q = require('q'),
	contract = require('../data/summaryContract.js').law,
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	log = require('../log.js');

var buildUpdateString = function(project){
	return "UPDATE " + contract.tableName + " SET nd_folder_url = " + pg.dollarize(project.url) +
		", nd_law_title = " + pg.dollarize(project.title) +
		" WHERE nd_folder_url IS NULL AND law_title ILIKE " + pg.dollarize("%" + project.title + "%");
}

var updateSqlSequence = function(projects){
	console.log(projects.length);
	return function(args){
		return Q.promise(function(resolve, reject, notify){

			var updatePromises = [];

			projects.forEach(function(project){
				updatePromises.push(pg.tQueryPromise(buildUpdateString(project))(args));
			});

			Q.all(updatePromises).then(function(){
				resolve(args);
			}).catch(log);

		});
	}
}

var updateNDfolderUrl = function(){
	return Q.promise(function(resolve, reject, notify){

		ndConnector.getProjects().then(
			function(projects){
				pg.startTransaction()
					.then(updateSqlSequence(projects))
					.then(pg.closeTransaction)
					.then(function(){
						resolve();
					}).catch(reject);
			});

	});
}

var buildOpinions = function(folderUrls){
	return Q.promise(resolve, reject, notify){
		pg.queryPromise("SELECT nd_law_title, nd_folder_url FROM " + contract.tableName + " WHERE nd_folder_url IS NOT NULL")
			.then(function(results){
				results.rows.forEach(function(result){
					var debates = new Debate(result.nd_folder_url, result.nd_law_title);

					debates.on("err", reject);
					debates.on("structured", function(){
						
					});
				});
			});
	}
	
}

updateNDfolderUrl().catch(log);

