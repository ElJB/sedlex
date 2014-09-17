var pg = require('pg'),
    dbConnect = require('../res/settings.js').db,
    summaryContract = require('./summaryContract'),
    Q = require('q');

var sqlCreateSummarizeTableQuery = function(tableName){
  return "CREATE TABLE " + tableName + " (" +
  summaryContract.colId + " SERIAL," +
  summaryContract.colSourceText + " TEXT NOT NULL," +
  summaryContract.colUrl + " TEXT NOT NULL," +
  summaryContract.colModel + " TEXT," +
  summaryContract.colModelParam + " TEXT," +
  " UNIQUE (" + summaryContract.colSourceText + ", " + summaryContract.colModel + ", " +
  summaryContract.colModelParam + ") );";
}

var sqlCreateSummarizeTable = sqlCreateSummarizeTableQuery(summaryContract.tableName);

var clientPromise = Q.promise(function(resolve, reject, notify){
  pg.connect(dbConnect, function(err, client, done){
    if(err){
      console.log("Couldn't connect to postgress");
    } else {
      resolve(client);
    }
  });
});

var createSummaryTable = function(client){
  return Q.promise(function(resolve,reject, notify){
    client.query(sqlCreateSummarizeTable, function(err, result){
      if(err){
        console.log("Couldn't create summary table: " + err);
      } else {
        resolve(client);
      }
    });
  });
}

var promiseQueryBuilder = function(queryString, deferred){
  return function(client){
    return Q.promise(function(resolve, reject, notify){
      client.query(queryString, function(err, result){
        if(err){
          if(deferred){
            deferred.reject(err)
          };
          reject(err);
        } else {
          if(deferred){
            deferred.resolve(result);
          }
          resolve(client);
        }
      });
    });
  }
}

module.exports = {
  sqlCreateSummarizeTable: sqlCreateSummarizeTable,
  sqlCreateSummarizeTableQuery: sqlCreateSummarizeTableQuery,
  clientPromise: clientPromise,
  createSummaryTable: createSummaryTable,
  promiseQueryBuilder: promiseQueryBuilder
}
    

