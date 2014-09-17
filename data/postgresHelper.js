var pg = require('pg'),
    dbConnect = require('../res/settings.js').db,
    summaryContract = require('./summaryContract'),
    Q = require('q');

var sqlCreateSummarizeTableString = function(tableName){
  return "CREATE TABLE " + tableName + " (" +
  summaryContract.colId + " SERIAL, " +
  summaryContract.colSourceText + " TEXT NOT NULL, " +
  summaryContract.colUrl + " TEXT NOT NULL, " +
  summaryContract.colModel + " TEXT, " +
  summaryContract.colModelParam + " TEXT, " +
  summaryContract.colSummary + " TEXT NOT NULL," +
  " UNIQUE (" + summaryContract.colSourceText + ", " + summaryContract.colModel + ", " +
  summaryContract.colModelParam + "));";
}

var sqlCreateSummarizeTable = sqlCreateSummarizeTableString(summaryContract.tableName);

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


/**
Utility function to allow chained query. You can pass a Query queryString
or a function that will take a result as argument and return a queryString.
**/
var promiseQueryBuilder = function(queryBuilder){
  return function(client, result){
    var queryString = queryBuilder && typeof(queryBuilder) == 'function' ? queryBuilder(result)
      : queryBuilder;
    return Q.promise(function(resolve, reject, notify){
      client.query(queryString, function(err, result){
        if(err){
          reject(err);
        } else {
          resolve(client, result);
        }
      });
    });
  }
}

var buildSQLInsertString = function(tableName, columns, data){
  var result = "INSERT into " + tableName;
  if( columns ){
    result += " (";
    for( c in columns ){
      result += columns[c] + ", ";
    }
    result = result.substring(0, result.length - 2) + ")"
  }
  result += " VALUES (";
  for( d in data ){
    result += data[d] + ", "
  }
  //console.log(result.substring(0, result.length - 2) + ");");
  return result.substring(0, result.length - 2) + ");";
}

//console.log(sqlCreateSummarizeTable);

module.exports = {
  sqlCreateSummarizeTable: sqlCreateSummarizeTable,
  sqlCreateSummarizeTableString: sqlCreateSummarizeTableString,
  clientPromise: clientPromise,
  createSummaryTable: createSummaryTable,
  promiseQueryBuilder: promiseQueryBuilder,
  buildSQLInsertString: buildSQLInsertString
}
    

