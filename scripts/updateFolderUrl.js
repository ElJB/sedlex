var ndConnector = require('../data/apiConnector/ndConnector.js'),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	Q = require('q'),
	contract = require('../data/summaryContract.js').law,
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	log = require('../log.js');

var pg = new pgHelper(dbConnect);

// var stopWords = ["loi", "programmation", "projet", "proposition", "pour"];
// 
// var fuzzyTitleMatch = function(title){
// 	var tokens = title.split(/ |-/).filter(function(token){
// 		token = token.toLowerCase();
// 		return token.length > 3 && stopWords.indexOf(token) == -1;
// 	});
// 	if( tokens.length > 2 ){
// 		tokens = tokens.filter(function(token){
// 			return !token.match(flexedFormRe);
// 		});
// 	}
// 	if( tokens.length == 0){
// 		throw new Error("Invalid fuzzyTitleMatch");
// 	}
// 	return "%" + tokens.join("%") + "%"
// }

var fuzzyUrlMatch = function(url){
	return "%" + url.match(/dossiers\/([^\.]+)\.asp/)[1] + "%";
}

var buildUpdateString = function(project){
	return "UPDATE " + contract.tableName + " SET nd_folder_url = " + pg.dollarize(project.url) +
		", nd_law_title = " + pg.dollarize(project.title) +
		" WHERE (nd_folder_url IS NULL OR nd_law_title IS NULL) AND parliament_folder_url ILIKE " + pg.dollarize(fuzzyUrlMatch(project.pltUrl));
}

var updateSqlSequence = function(projects){
	console.log(projects.length);

	//remove non Law "project" from regards citoyens website (those without a link to parliament website)
	projects = projects.filter(function(project){
		return project.pltUrl;
	});

	return function(args){
		return Q.promise(function(resolve, reject, notify){

			var serialUpdate = function(projects){
				var project = projects.splice(0, 1)[0];
				pg.tQueryPromise(buildUpdateString(project))(args)
					.then(function(){
						if( projects.length ){ return serialUpdate(projects) }
						resolve(args);
					}).catch(reject);
			}

			serialUpdate(projects);

		});
	}
}

var addPltUrlToProject = function(projects){
	return Q.promise(function(resolve, reject, notify){
		var promises = [];

		projects.forEach(function(project){
			promises.push(Q.promise(function(resolve, reject, notify){
				crawler.queue([{
					url: project.url,
					callback: function(err, result, $){
						if( err ){ return reject(err); }
						try {
							project.pltUrl = $('.source:contains("Dossier sur") a')[0].href;
						} catch(e) {}
						resolve(project);
					}
				}]);
			}));
			
		});

		Q.all(promises)
			.then(function(projects){
				resolve(projects);
			}).catch(reject);
	});
}

var updateNDfolderUrl = function(){
	return Q.promise(function(resolve, reject, notify){

		ndConnector.getProjects()
			.then(addPltUrlToProject)
			.then(function(projects){
				pg.startTransaction()
					.then(updateSqlSequence(projects))
					.then(pg.closeTransaction)
					.then(function(){
						resolve();
					}).catch(reject);
			});

	});
}

updateNDfolderUrl().catch(log);

