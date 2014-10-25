var Q = require('Q'),
	rcConnector = require('../data/apiConnector/rcConnector.js'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	Crawler = require('crawler').Crawler,
	crawler = new Crawler({
		"maxConnections": 10
	}),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	speechContract = require('../data/summaryContract').speech;

var pg = new pgHelper(dbConnect);

var extractDivId = /#.+/,
	fetchedUrls;

var saveFetchedUrls = function(urls){
	return Q.promise(function(resolve){
		fetchedUrls = urls.rows.map(function(url){ return url["url"] }); 
		resolve();
	});
}

var fetchText = function(result){
	var lawId = result[0],
		debates = result[1];

	return Q.promise(function(resolve, reject, notify){

		var audience = debates.getAudience(0);

		if( !audience || !debates.getAudience(0).getDivision(0).getGroup("Rapporteurs") ){
			return reject(new Error(lawId + ": debate file incomplete"));
		}
		
		var orator = audience.getDivision(0).getGroup("Rapporteurs").getOratorByLengthUri(0);

		if( fetchedUrls.indexOf(orator.link) != -1 ){
			return reject();
		}

		fetchedUrls.push(orator.link);

		crawler.queue([{
			"uri": orator.link,
			"callback": function(err, result, $){
				if(err){ reject(err); } else { writeToDb([result, $, lawId, debates, audience, orator]) }
			}
		}]);

	});
};

var writeToDb = function(args){
	var result = args[0],
		$ = args[1],
		lawId = args[2],
		debates = args[3],
		audience = args[4]
		orator = args[5];
	debug(result.uri);
	var divId = extractDivId.exec(result.uri)[0];
	var re = new RegExp(orator.name, "i");

	var extractFullText = function($){
		return $(".perso a").filter(function(i, e){ return re.exec(e.innerHTML) })
			.parent().parent().parent().find(".texte_intervention").text();
	}

	var text = pg.dollarize(extractFullText($));
	var date = audience.getDivision(0).date;
	var procedure = audience.name.split("_");


	var sqlInsertString = pg.buildSQLInsertString(speechContract.tableName, speechContract.getColumns(),
		[pg.dollarize(result.uri), text, pg.quotify(lawId), pg.quotify(date),
			pg.quotify(orator.nb_intervs), pg.quotify(orator.nb_mots), Number(procedure[0]),
			pg.quotify(procedure[1]), pg.quotify(procedure[2]), pg.quotify(procedure[3] == "commission")]);

	pg.queryPromise(sqlInsertString)
		.then(debug)
		.catch(log);
}

var loadAndWriteInterventions = function(projects){
	projects.forEach(function(project){
		rcConnector.loadIntervention(project)
			.then(fetchText)
			.then(writeToDb)
			.catch(log)
			.done();
	});
}

pg.queryPromise("SELECT url FROM speech")
	.then(saveFetchedUrls)
	.then(rcConnector.loadProjects)
	.then(loadAndWriteInterventions)
	.catch(log)
	.done();
