var contract = require('../data/summaryContract.js'),
	connector = require('vie-publique'),
	ndConnector = require('nd-connector'),
	Q = require('q'),
	Crawler = require('crawler'),
	crawler = new Crawler({
		"maxConnections": 10
	});

var projectCount = 0;
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
	console.log("Vie publique loaded");

	return Q.all(promises);
})
.then(function(){
	return ndConnector.getProjects();
})
.then(function addPltUrlToProject(projects){
	var deferred = Q.defer(),
		iCount = 0;

	projectCount = projects.length;

	projects.forEach(function(project){

		crawler.queue([{
			url: project.url,
			retries: 5,
			callback: function(err, result, $){
				if( err ){ return deferred.notify(err); }
				try {
					project.pltUrl = $('.source:contains("Dossier sur") a')[0].attribs.href;
				} catch(e) {}
				deferred.notify(project);
				iCount += 1;
				if( iCount == projectCount ){
					deferred.resolve();
				}

			}
		}]);
	});

	console.log("Nos deputes loaded");

	return deferred.promise;
})
.progress(function(project){
	if( project instanceof Error){
		return log(project);
	}

	if( project.pltUrl ){
		contract.updateLawWithND(project)
		.catch(log);
	}
})
.then(function(){
	console.log("NDFolders loaded");
})
.catch(log);

function fuzzyUrlMatch(url){
	return "%" + url.match(/dossiers\/([^\.]+)\.asp/)[1] + "%";
}

function log(e){
	console.log(e.stack);
}

