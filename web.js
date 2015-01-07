var express = require('express')
	, app = express()
	, compression = require('compression')
	, server = require('http').createServer(app)
	, contract = require('./data/contract.js');

app.use(compression({}));

app.get('/laws', function(req, res){
	var page = 0;
	if (req.query.page){
		page = parseInt(req.query.page);
	}
	contract.findAllLawsUntil(new Date(2010,0,0), page)
	.then(function(results){
		raw_laws = results[0];
		laws = [];
		raw_laws.forEach(function(raw_law){
			law = {
			"_id" : raw_law['_id'],
			"last-update" : raw_law['date'],
			"title" : raw_law['law_title'],
			"summary" : raw_law['summary'],
			"progression" : ["loi-ratification_ordonnance"], //raw_law['status'] TODO fonction status to progression
			"category" : JSON.parse(raw_law['tags']) // TODO tags avec ids (pour pouvoir filtrer par tags dans l'appli)
			};
			if(raw_law['nd_law_title']){
				law['title'] = raw_law['nd_law_title'];
			}
			laws.push(law);
		});

		res.json({ laws: laws});
	}).catch(log);
});

app.get('/laws/:id', function(req, res){
	contract.findLawById(req.params.id)
	.then(function(results){
		raw_law = results[0][0];
		law = {
		"_id" : raw_law['_id'],
		"last-update" : raw_law['date'],
		"title" : raw_law['law_title'],
		"summary" : raw_law['summary'],
		"content" : raw_law['content'],
		"progression" : ["loi-ratification_ordonnance"], //raw_law['status'] TODO fonction status to progression
		"category" : JSON.parse(raw_law['tags']) // TODO tags avec ids (pour pouvoir filtrer par tags dans l'appli)
		};
		if(raw_law['nd_law_title']){
			law['title'] = raw_law['nd_law_title'];
		}

		res.json({law: law});
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
