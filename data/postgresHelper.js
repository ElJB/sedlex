var pg = require('pg'),
    dbConnect = require('../res/settings.js').db,
    summaryContract = require('./summaryContract').summary,
    sourceContract = require('./summaryContract').source,
    Q = require('q')
    debug = require('../debug.js');

var pgHelper = {
  ready: false,
  whenReady: [],
  go: function(){
    this.ready = true;
    for( i in this.whenReady ){
      this.whenReady[i]();
    }
  }
};

pg.connect(dbConnect, function(err, client, done){
  if(err){
    console.log("Couldn't connect to postgress");
  } else {
    pgHelper.client = client;
    pgHelper.go();
    pgHelper.close = done;
  }
});

pgHelper.sqlCreateSummarizeTableString = function(tableName){
  var resultString = "CREATE TABLE " + tableName + " (" +
  summaryContract.columns.colId + " SERIAL, " +
  summaryContract.columns.colSource + " TEXT NOT NULL, " +
  summaryContract.columns.colModel + " TEXT, " +
  summaryContract.columns.colModelParam + " TEXT, " +
  summaryContract.columns.colSummary + " TEXT NOT NULL," +
  " UNIQUE (" + summaryContract.columns.colSource + ", " + summaryContract.columns.colModel + ", " +
  summaryContract.columns.colModelParam + "));";
  debug(resultString);
  return resultString;
//TO DO: add foreign key
}

pgHelper.queryPromise = function(queryString){
  return Q.promise(function(resolve, reject, notify){
    var queryDb = function(){
      pgHelper.client.query(queryString, function(err, result){
        if(err){
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
    if( pgHelper.ready ){
      queryDb();
    } else {
      pgHelper.whenReady.push(queryDb);
    }
    
  });
}

pgHelper.chainQueryPromise = function(queryBuilder){
  return function(result){
    var queryString = typeof(queryBuilder) == "string" ? queryBuilder : queryBuilder(result);
    return pgHelper.queryPromise(queryString);
  }
}

pgHelper.buildSQLInsertString = function(tableName, columns, data){
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
  debug(result.substring(0, result.length - 2) + ");");
  return result.substring(0, result.length - 2) + ");";
}

pgHelper.getTables = function(){
  return pgHelper.queryPromise("SELECT table_name FROM information_schema.tables " +
  "WHERE table_schema='public' AND table_type='BASE TABLE';");
}

pgHelper.quotify = function(s){
  return "'" + s + "'";
}

pgHelper.dollarize = function(s){
  return "$$" + s + "$$";
}

module.exports = pgHelper;
    

