var http = require('https'),
	Q = require('q'),
	path = require('path'),
	debug = require('../../debug.js'),
	url = require('url');

var connector = {},
	//TO DO: remove key reference from code
	mlUserKey = "kCDSIahRSZmsh85cIh3UXqF3a07Mp14P4YfjsncOjNEyVf5wvI",
	mlHost = "nehac-ml-analyzer.p.mashape.com";

var options = {
	host: mlHost,
	path: "/article"
}

connector.getText = function(text){
	return Q.promise(function(resolve, reject, notify){
		var query = {
			size: 5,
			text: text
		}
		options.headers = {
			"accept": "*/*",
			"X-Mashape-Key": mlUserKey
		}
		options.path = options.path + url.format({query: query});
		debug(options);

		var req = http.request(options);

		req.on("response", function(res){
			var result = "";
			res.on("data", function(chunk){
				result += chunk;
			});

			res.on("end", function(){
				console.log(result);
				resolve(JSON.parse(result).id);
			})
		});

		req.on("error", function(err){
			reject(err);
		});

		req.end();
	});
}

module.exports = connector;

