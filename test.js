var Q = require('Q');

var defer = Q.defer();

defer.promise.progress(console.log);

defer.notify("bla");
defer.notify("bla");