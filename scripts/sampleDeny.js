var pgHelper = require('pg-helper'),
	Alpage = require('alpage-connector'),
	dbConnect = require('../res/settings.js').db,
	Q = require('q');

var pg = new pgHelper(dbConnect);

var logLemma = function(result){
	var deferred = Q.defer();

	var sentence = result.rows.splice(0, 1)[0].sentence;

	console.log(sentence);

	var alpage = new Alpage(sentence);

	alpage.parse()
		.then(function(tree){
			tree.not();
			console.log(tree.lemmaString());

			if( result.rows.length ){
				logLemma(result)
					.then(deferred.resolve)
					.catch(deferred.reject);
			} else {
				deferred.resolve();
			}
		}).catch(deferred.reject);

	return deferred.promise;
}

pg.queryPromise("SELECT sentence FROM corpus WHERE lemma_sentence ILIKE $$%être considérer%$$")
	.then(logLemma)
	.then(function(err){
		console.log(err.stack);
	});