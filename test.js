var pg = require('pg');

pg.connect(function(){})

pg.connect(function(){})

console.log(pg.pools.getOrCreate().getPoolSize());