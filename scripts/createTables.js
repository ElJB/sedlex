var Q = require('Q'),
	debug = require('../debug.js'),
	log = require('../log.js'),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('pg-helper'),
	contract = require('../data/summaryContract');

var pg = new pgHelper(dbConnect);

var LOG = __filename + ": ";

var checkExist = function(result){
	return Q.promise(function(resolve, reject, notify){
		var existing = {};
		result.rows.forEach(function(row){
			for( i in contract ){
				existing[i] = existing[i] ? true : row.table_name == contract[i].tableName;
			}
		});
		var promises = [];

		if( Object.keys(existing).map(function(key){ return existing[key]; }).reduce(function(a, b){ return a && b;}) ){
			return resolve();
		}

		for( table in existing ){
			if( !existing[table] ){
				promises.push(pg.queryPromise(contract[table].createDbString()));
			}
		}

		Q.all(promises)
			.then(function(results){
				resolve(results);
			}).catch(reject);
	});
}

var confirmCreation = function(results){
	if( results ){
		results.forEach(function(result){
			console.log(LOG + "Created table");
		});
	}
}

var createTables = function(){
	return Q.promise(function(resolve, reject, notify){
		pg.getTables()
			.then(checkExist)
			.then(confirmCreation)
			.then(function(){
				resolve();
			})
			.catch(reject);
	});
}

createTables().catch(log);

module.exports = createTables;