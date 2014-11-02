var pgHelper = require('pg-helper'),
	approval = require('approval'),
	contract = require('../data/summaryContract.js').speech;

var pg = new pgHelper({
	user: "boniface",
	database: "boniface",
	password: "blabla",
	host: "localhost"
});

var prepRating = function(rating){
	return {
		n_sentences: rating.length,
		positive: rating.length ? rating.reduce(function(a, b){ return a + Number(b == 'positive')}, 0) / rating.length : 0,
		negative: rating.length ? rating.reduce(function(a, b){ return a + Number(b == 'negative')}, 0) / rating.length : 0,
		useless: rating.length ? rating.reduce(function(a, b){ return a + Number(b == 'useless')}, 0) / rating.length : 0
	}
}

var updateSpeechEntry = function(id){
	return function(rating){
		pg.queryPromise("UPDATE " + contract.tableName + " SET rated_sentences = " + rating.n_sentences +
			", positive = " + rating.positive + ", negative = " + rating.negative + ", useless = " + rating.useless +
			" WHERE _id = " + id)
			.catch(function(err){
				console.log(err.stack);
			});
	}
}

var preRateSpeech = function(speeches){
	var speech = speeches.rows.splice(0, 1)[0];
	var text = speech.speech,
		id = speech._id;

	approval(text)
		.then(prepRating)
		.then(updateSpeechEntry(id))
		.then(function(){
			if( speeches.rows.length ){
				preRateSpeech(speeches);
			}
		}).catch(function(err){
			console.log(err.stack);
		});
}

pg.queryPromise("SELECT _id, speech FROM speech WHERE rated_sentences IS NULL")
	.then(preRateSpeech)
	.catch(function(err){
		console.log(err.stack);
	});