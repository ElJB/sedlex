var	pgHelper = require('pg-helper'),
	Q = require('q'),
	contracts = require('../data/summaryContract.js'),
	log = require('../log.js'),
	Alpage = require('alpage-connector');

var pg = new pgHelper({
	user: "boniface",
	database: "boniface",
	password: "blabla",
	host: "localhost"
});

var sentenceRe = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ][^\.?!]+[^ABCDEFGHIJKLMNOPQRSTUVWXYZ][\.?!]/g;

function textToSentences(sqlResult){
	var result = [];

	sqlResult.rows.forEach(function(row){
		result.push([row._id, row.speech.match(sentenceRe)]);
	});

	return result;
}

function parse(texts){

	var text = texts.splice(0, 1)[0];
	var id = text[0],
		sentences = text[1];

	parseSentences(sentences, id)
		.catch(function(err){
			console.log(err.stack);
		}).fin(function(){
			if( texts.length ){
				parse(texts);
			}
		});
}

function parseSentences(sentences, id){
	var sentence = sentences.splice(0, 1)[0],
		deferred = Q.defer();

	var alpage = new Alpage(sentence);

	alpage.parse()
		.then(function(tree){
			tree.not()
			writeSentenceToDb(sentence, tree.lemmaString(), id);
		}).catch(function(err){
			console.log(err.stack);
		}).fin(function(){
			if( sentences.length ){
				parseSentences(sentences, id)
					.fin(deferred.resolve);
			} else {
				deferred.resolve();
			}
		})

	return deferred.promise;
}

function writeSentenceToDb(sentence, lemmaSentence, id){
	pg.queryPromise(pg.buildSQLInsertString(contracts.sentence.tableName,
		contracts.sentence.getColumns(),
		[id,
		 pg.dollarize(sentence),
		 pg.dollarize(lemmaSentence)]))
		.catch(function(err){
			console.log(err.stack);
		});
}

pg.queryPromise("SELECT speech.speech as speech, speech._id as _id FROM speech \
LEFT JOIN sentence ON speech._id = sentence.speech_id WHERE lemma_sentence IS NULL;")
	.then(textToSentences)
	.then(parse)
	.catch(function(err){
		console.log(err.stack);
	})