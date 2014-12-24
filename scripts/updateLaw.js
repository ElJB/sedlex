var contract = require('../data/summaryContract.js'),
	connector = require('vie-publique'),
	ndConnector = require('../data/apiConnector/ndConnector.js'),
	Q = require('q'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	});

Q.all([connector.getSummaries(), contract.lawMaxDate()])
.then(function(results){
	var promises = [],
		summaries = results[0],
		maxDate = new Date(results[1][0][0]['max(date)']);

	summaries = summaries.filter(function filterSummary(summary){
		return new Date(summary.date) >= maxDate;
	});

	summaries.forEach(function upsert(summary){
		promises.push(contract.upsert("/law",
						contract.tables.law.getColumns(),
						[summary.law_title,
						 summary.summary,
						 summary.content,
						 summary.url,
						 summary.date,
						 summary.status,
						 JSON.stringify(summary.tags),
						 summary.parliament_folder_url,
						 null,
						 null]))
	});

	return Q.all(promises);
})
.then(function(){
	return ndConnector.getProjects();
})
.then(function addPltUrlToProject(projects){
	var promises = [];

	projects.forEach(function(project){
		var deferred = Q.defer();
		promises.push(deferred.promise);

		crawler.queue([{
			url: project.url,
			callback: function(err, result, $){
				if( err ){ return deferred.reject(err); }
				try {
					project.pltUrl = $('.source:contains("Dossier sur") a')[0].href;
				} catch(e) {}
				deferred.resolve(project);
			}
		}]);
	});

	return Q.all(promises);
})
.then(function(projects){
	var promises = [];

	projects = projects.filter(function(project){
		return project.pltUrl;
	});

	projects.forEach(function updateDb(project){
		promises.push(contract.updateLawWithND(project));
	});

	return Q.all(promises);
})
.catch(log);

var fuzzyUrlMatch = function(url){
	return "%" + url.match(/dossiers\/([^\.]+)\.asp/)[1] + "%";
}

function log(e){
	console.log(e.stack);
}

