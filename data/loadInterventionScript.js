var Q = require('Q'),
	rcConnector = require('./apiConnector/rcConnector.js'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	pg = require('./postgresHelper.js'),
	sourceContract = require('./summaryContract').source;

var extractDivId = /#.+/,
	fetchedUrls;

var checkExist = function(result){
	return Q.promise(function(resolve, reject){
		var existingSourceTable = false;
		result.rows.forEach(function(row){
			existingSourceTable = row.table_name == sourceContract.tableName;
		});

		if( !existingSourceTable ){
			pg.queryPromise(sourceContract.createDbString())
				.then(function(){
					resolve();
				})
				.catch(reject);
		} else {
			resolve();
		}
	});
}

var saveFetchedUrls = function(urls){
	return Q.promise(function(resolve){
		fetchedUrls = urls.rows.map(function(url){ return url["source_url"] }); 
		resolve();
	});
}

var fetchText = function(result){
	var lawId = result[0],
		debates = result[1];

	return Q.promise(function(resolve, reject, notify){

		if( !debates.getAudience(0) || !debates.getAudience(0).getDivision(0).getGroup("Rapporteurs") ){
			return reject(new Error(lawId + ": debate file incomplete"));
		}
		var uri = debates.getAudience(0).getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0);
		if( fetchedUrls.indexOf(uri) != -1 ){
			return reject();
		}
		fetchedUrls.push(uri);
		crawler.queue([{
			"uri": uri,
			"callback": function(err, result, $){
				if(err){ reject(err); } else { writeToDb([result, $, lawId, debates]) }
			}
		}]);
	});
};

var writeToDb = function(args){
	var result = args[0],
		$ = args[1],
		lawId = args[2],
		debates = args[3];
	debug(result.uri);
	var divId = extractDivId.exec(result.uri)[0];
	var text = "$$" + $(divId + " .texte_intervention").text() + "$$";
	var date = debates.getAudience(0).getDivision(0).date;
	var sqlInsertString = pg.buildSQLInsertString(sourceContract.tableName, sourceContract.getColumns(),
		["$$" + result.uri + "$$", text, pg.quotify(lawId), pg.quotify(date)]);
	pg.queryPromise(sqlInsertString)
		.then(debug)
		.catch(log);
}


pg.getTables()
	.then(checkExist)
	.then(function(){
		return pg.queryPromise("SELECT source_url FROM source")
	})
	.then(saveFetchedUrls)
	.then(rcConnector.loadTree)
	.progress(fetchText)
	.catch(log)
	.done();
