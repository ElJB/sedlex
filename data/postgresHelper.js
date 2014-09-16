var pg = require('pg'),
    dbConnect = require('../res/settings.js').db,
    summaryContract = require('./summaryContract'),
    Q = require('q');

var sqlCreateSummarizeTable = "CREATE TABLE " + summaryContract.tableName + " (" +
  summaryContract.colId + " SERIAL," +
  summaryContract.colSourceText + " TEXT NOT NULL," +
  summaryContract.colUrl + " TEXT NOT NULL," +
  summaryContract.colModel + " TEXT," +
  summaryContract.colModelParam + " TEXT," +
  " UNIQUE (" + summaryContract.colSourceText + ", " + summaryContract.colModel + ", " +
  summaryContract.colModelParam + ") );";

var clientPromise = function(){
  return Q.promise(function(resolve, reject, notify){
    pg.connect(dbConnect, function(err, client, done){
      if(err){
        console.log("Couldn't connect to postgress");
      } else {

        client.pQuery = promiseQuery;
        resolve(client);
      }
    });
  });
}

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

var promiseQuery = function(queryString){
  return function(client){
    Q.promise(resolve, reject, notify){
      client.query(queryString, function(err, result){
        if(err){
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  }
}

module.exports = {
  sqlCreateSummarizeTable: sqlCreateSummarizeTable,
  clientPromise: clientPromise,
  createSummaryTable: createSummaryTable,
  promiseQuery: promiseQuery
}
    

