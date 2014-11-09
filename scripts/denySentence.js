var pgHelper = require('pg-helper'),
	Alpage = require('alpage-connector'),
	dbConnect = require('../res/settings.js').db,
	Q = require('q');

var pg = new pgHelper(dbConnect);

var lemmatize = function(result){
	var deferred = Q.defer(),
		row = result.rows.splice(0, 1)[0];

	var sentence = row.sentence,
		id = row._id;

	var alpage = new Alpage(sentence);
	alpage.parse()
		.then(function(tree){
			tree.not()

			updateDb(tree.lemmaString(), id);
		}).catch(function(err){
			console.log(err.stack);
		}).fin(function(){
			if( !result.rows.length ){
				deferred.resolve();
			} else {
				lemmatize(result)
					.then(deferred.resolve);
			}
		});

	return deferred.promise;
}

var updateDb = function(sentence, id){

	pg.queryPromise("UPDATE corpus SET lemma_sentence = " + pg.dollarize(sentence) + " WHERE _id = " + id)
		.catch(function(err){
			console.log(err.stack);
		});
}

pg.queryPromise("SELECT _id, sentence FROM corpus WHERE lemma_sentence IS NULL")
	.then(lemmatize)