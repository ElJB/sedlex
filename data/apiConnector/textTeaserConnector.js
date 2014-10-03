var http = require('http'),
	Q = require('q'),
	path = require('path'),
	debug = require('../../debug.js'),
	url = require('url');

var connector = {},
	//TO DO: remove key reference from code
	textTeaserUserKey = "yhpbXbefO9Ad5PArLlYu",
	ttHost = "api.textteaser.com";

var postOptions = {
			host: ttHost,
			path: "/post",
			method: "POST"
	},
	getOptions = {
		host: ttHost,
		path: path.join("/get", textTeaserUserKey, "[id]")
	};

connector.postText = function(text){
	return Q.promise(function(resolve, reject, notify){
		var query = {
			user: textTeaserUserKey,
			title: "",
			text: text
		}
		postOptions.headers = {
			"content-length": text.length,
			'content-type': 'text/plain',
			"accept": "*/*",
		}
		postOptions.path = postOptions.path + url.format({query: query});
		debug(postOptions);

		var req = http.request(postOptions);

		req.on("response", function(res){
			debug("Got a response!");
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

connector.getText = function(id){
	return Q.promise(function(resolve, reject, notify){
		getOptions.path = path.join(getOptions.path, "..", id);
		var req = http.request(getOptions);

		req.on("response", function(res){
			var result = "";
			res.on("data", function(chunk){
				result += chunk;
			});

			res.on("end", function(){
				var sentences = JSON.parse(result).sentences;
				sentences.reduce(function(a, b){
					return a + b.sentence;
				}, "");
				resolve(sentences);
			})
		});

		req.on("error", function(err){
			reject(err);
		});
	});
}

module.exports = connector;

