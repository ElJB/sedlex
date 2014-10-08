var SummaryTool = require('node-summary'),
	Q = require('q'),
	pg = require('../../data/postgresHelper.js'),
	log = require('../../log.js'),
	debug = require('../../debug.js'),
	summaryContract = require('../../data/summaryContract').summary;

var params = {
	sentenceCount: 6
}

var getSummarizedSpeech = function(speeches){
	return Q.promise(function(resolve){
		summarizedSpeeches = speeches.rows.map(function(speech){ return speech["speech_id"] }); 
		resolve(summarizedSpeeches);
	});
}

var writeSummary = function(row){
	return Q.promise(function(resolve, reject, notify){
		SummaryTool.getSortedSentences(row.text, params.sentenceCount, function(err, summary){
			if(err){ return log(err)};
			pg.queryPromise(pg.buildSQLInsertString(summaryContract.tableName,
				summaryContract.getColumns(),
				[row._id,
					pg.quotify("node-summary"),
					pg.dollarize(JSON.stringify(params)),
					pg.dollarize(summary)]))
				.then(function(result){
					debug(result);
				})
				.catch(log);
		});
	});
}

pg.queryPromise("SELECT speech_id FROM summary;")
	.then(getSummarizedSpeech)
	.then(function(summarizedSpeeches){
		var speechCursor = new pg.Cursor("SELECT * FROM speech WHERE _id NOT IN (" + summarizedSpeeches.toString() + ");");
		speechCursor.whileNext(5, function(rows){
				rows.forEach(writeSummary);
			})
			.fin(function(){
				speechCursor.close();
			}).catch(log);
		});




