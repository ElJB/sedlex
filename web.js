var express = require('express')
	, app = express()
	, compression = require('compression')
	, server = require('http').createServer(app)
	, models = require('./models');

app.use(compression({}));

var LAWS_PER_PAGE = 10;

app.get('/laws', function(req, res){
	var page = 0;
	if (req.query.page){
		page = parseInt(req.query.page);
	}
	models.Law.findAll({
		limit: LAWS_PER_PAGE,
		offset: LAWS_PER_PAGE*page,
		order: "createdAt DESC" ,
		include: [models.Category]
	})
	.then(function(laws){
		res.json({ laws: laws});
	}).catch(log);
});

app.get('/laws/:id', function(req, res){
	models.Law.find({
		where: { id: req.params.id},
		include: [models.Category]
	})
	.then(function(law){
		res.json({law:law})
	}).catch(log);
});

/*
Server starting to listen
*/

var port = process.env.PORT || 5000;
server.listen(port, function() {
	console.log("Listening on " + port);
});

function log(e){
	console.log(e.stack);
}
