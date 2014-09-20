var rcConnector = require('./apiConnector/rcConnector.js'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	pg = require('./postgresHelper.js'),
	sourceContract = require('./summaryContract').source;

var extractDivId = /#.+/

pg.getTables().then(function(result){
	var existingSourceTable = false;
	result.rows.forEach(function(row){
		existingSourceTable = row.table_name == sourceContract.tableName;
	});

	if( !existingSourceTable ){
		pg.queryPromise(sourceContract.createDbString())
			.then(crawlRCApi)
			.catch(log);
	} else {
		crawlRCApi();
	}
}).catch(log);

var crawlRCApi = function(){
	rcConnector.loadTree(function(err, result){
		var lawId = result[0],
			debates = result[1],
			group;

		pg.queryPromise("SELECT source_url FROM source").then(function(fetchedUrls){
			fetchedUrls = fetchedUrls.rows.map(function(url){ return url["source_url"] });

			debug(lawId);
			if( debates.getAudience(0) && debates.getAudience(0).getDivision(0).getGroup("Rapporteurs") &&
				(fetchedUrls.indexOf(debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0))) == -1){
				crawler.queue([{
					"uri": debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0),
					"callback": writeToDb
				}]);
			}
		}).catch(log);

		var writeToDb = function(err, result, $){
			debug(result.uri);
			var divId = extractDivId.exec(result.uri)[0];
			var text = "$$" + $(divId + " .texte_intervention").text() + "$$";
			var date = debates.getAudience(0).getDivision(0).date;
			var sqlInsertString = pg.buildSQLInsertString(sourceContract.tableName, sourceContract.getColumns(),
				["$$" + result.uri + "$$", text, pg.quotify(lawId), pg.quotify(date)]);
			pg.queryPromise(sqlInsertString)
				.then(debug)
				.catch(function(err){
					console.log(lawId);
					log(err);

				});
		}
	});
}
