var pg = require('pg'),
	dbConnect = require('../res/settings.js').db,
	pgHelper = require('../data/postgresHelper.js');

pgHelper.clientPromise.then(createSummaryTable);
