var models = require('../models'),
	connector = require('vie-publique'),
	ndConnector = require('nd-connector'),
	Q = require('q'),
	Crawler = require('crawler'),
	Sequelize = require('sequelize'),
	SqlString = require('sequelize/lib/sql-string'),
	crawler = new Crawler({
		"maxConnections": 10
	});

var projectCount = 0;
Q.all([connector.getSummaries(), models.Law.max("vp_published")])
.then(function(results){
	var promises = [],
		summaries = results[0],
		maxDate = results[1];

	summaries = summaries.filter(function filterSummary(summary){
		return new Date(summary.date) >= maxDate;
	});

	summaries.forEach(function upsert(summary){
		models.Law.create({
			vp_title: summary.law_title,
			vp_summary: summary.summary,
			vp_content: summary.content,
			vp_status: summary.status,
			vp_published: summary.date,
			parliament_folder_url: summary.parliament_folder_url
		}).then(function(law){
			summary.tags.forEach(function(tag){
				models.Category.findOrCreate({
					where: {title: tag},
					defaults: {color: "2222FF"}
				})
				.then(function(category){
					law.addCategory(category, {source: "vie-publique"});
				});
			});
		});
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
		// update de la law en fonction du ND

		urlLike = SqlString.escape(fuzzyUrlMatch(project.pltUrl));
		models.Law.find({
			where: Sequelize.and("lower(parliament_folder_url) LIKE lower(" + urlLike + ")", null)
		})
		.then(function(law){
			if(law){
				console.log("!");console.log("!");console.log("!");console.log("!");
				law.updateAttributes({
					nd_folder_url: project.url,
					nd_law_title: project.title
				});
			}
		});
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

