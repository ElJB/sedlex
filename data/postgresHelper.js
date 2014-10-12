var pg = require('pg'),
    Cursor = require('pg-cursor'),
    dbConnect = require('../res/settings.js').db,
    summaryContract = require('./summaryContract').summary,
    speechContract = require('./summaryContract').speech,
    Q = require('q'),
    debug = require('../debug.js'),
    log = require('../log.js'),
    Cursor = require('pg-cursor'),
    utils = require('../utils.js'),
    assert = require('assert');

pgHelper = {};

/*
Promise implementation of pg.query
Include client pooling
*/

pgHelper.queryPromise = function(queryString){
  return Q.promise(function(resolve, reject, notify){
    pg.connect(dbConnect, function(err, client, done){
      if( err ){ return reject(err) }
      debug(queryString.substring(0, 100));
      var q = client.query(queryString)
      q.on("error", function(err){
        reject(err);
        done(client);
      });
      q.on("row", function(row, result) {
        result.addRow(row);
      });
      q.on("end", function(result){
        resolve(result);
        done(client);
      });
    });
  });
}

/*
Utility function to chain query promise
*/

pgHelper.chainQueryPromise = function(queryBuilder){
  return function(result){
    var queryString = typeof(queryBuilder) == "string" ? queryBuilder : queryBuilder(result);
    return pgHelper.queryPromise(queryString);
  }
}

/*
Promise implementation of Cursor
*/

pgHelper.Cursor = function(queryString){

  //TO DO: refactor to allow for parameterized query
  var self = this;
  this.cursor = Q.promise(function(resolve, reject, notify){
    pg.connect(dbConnect, function(err, client, done){
      if( err ){ return reject(err) }
      var cursor = client.query(new Cursor(queryString));
      resolve(cursor);
      self.cursor.close = function(){
        cursor.close();
        done();
      };
    });
  });
  this.cursor.catch(log);
}

pgHelper.Cursor.prototype.next = function(n){
  var self = this;
  if( !n ){ n = 1 }

  return Q.promise(function(resolve, reject, notify){
    self.cursor.then(function(cursor){
      cursor.read(n, function(err, rows){
        if(err){ 
          return reject(err);
          done();
        }
        resolve(rows);
      });
    });
  });
}

pgHelper.Cursor.prototype.whileNext = function(n, callback){
  if( typeof(n) == "function" ){
    callback = n;
    n = 1;
  }

  //TO DO: refactor with an event emitter

  var self = this;
  return Q.promise(function(resolve, reject, notify){

    var nextBatch = function(n, callback){
      self.next().then(function(rows){
        if( rows.length == 0){
          resolve();
          return;
        }
        callback(rows);
        nextBatch(n, callback);
      }).catch(reject);
    }

    nextBatch(n, callback);
  });
}

pgHelper.Cursor.prototype.close = function(){
  this.cursor.close();
}

/*
Transaction utility functions
*/

pgHelper.startTransaction = function(queryString){
  if( !queryString ){ queryString = "BEGIN" }

  return Q.promise(function(resolve, reject, notify){
    pg.connect(dbConnect, function(err, client, done){
      if( err ){ return reject(err) }
      var q = client.query(queryString)
      q.on("error", function(err){
        reject(err);
        done(client);
      });
      q.on("row", function(row, result) {
        result.addRow(row);
      });
      q.on("end", function(result){
        debug(queryString.substring(0, 100));
        resolve([result, client]);
      });
    });
  });
}

var rollback = function(client) {
  debug("ROLLBACK");
  client.query("ROLLBACK", function() {
    client.end();
  });
};

pgHelper.tQueryPromise = function(queryString){
  return function(args){
    var result = args[0],
        client = args[1];

    return Q.promise(function(resolve, reject, notify){
      debug(queryString);
      
      var q = client.query(queryString)
      q.on("error", function(err){
        reject(err);
        rollback(client);
      });
      q.on("row", function(row, result) {
        result.addRow(row);
      });
      q.on("end", function(result){
        resolve([result, client]);
      });
    });

  }
}

pgHelper.closeTransaction = function(args){
  var result = args[0],
      client = args[1];

  return Q.promise(function(resolve, reject, notify){
    debug("COMMIT");
    var q = client.query("COMMIT")
    q.on("error", function(err){
      reject(err);
      rollback(client);
    });
    q.on("row", function(row, result) {
      result.addRow(row);
    });
    q.on("end", function(result){
      resolve(result);
      client.end();
    });
  });
}


pgHelper.buildSQLInsertString = function(tableName, columns, data){
  assert(columns);
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
  var tag = "$" + utils.randomString(5) + "$";
  return tag + s + tag;
}

module.exports = pgHelper;
    

