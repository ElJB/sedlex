/*
Connector for www.nosdeputes.fr
*/

var Crawler = require("crawler").Crawler,
	path = require('path'),
	url = require('url'),
	debug = require('../../debug.js'),
	log = require('../../log.js'),
	connector = {},
	assert = require('assert'),
	Q = require('Q');


var crawler = new Crawler({
		"maxConnections":10
	}),
	ndUrl = "http://www.nosdeputes.fr/";

//TODO: create alert for connector breaking	

connector.getProjects = function(){
	return Q.promise(function(resolve, reject, notify){
		crawler.queue([{
			uri: url.resolve(ndUrl, "dossiers/date"),
			callback: function(err, result, $){
				if( err ){ return reject(err); }
				var projects = $('h2:contains(derniers)').next().find("a").toArray().map(
					function(e){
						return {
							url: url.resolve(ndUrl, e.href),
							title: e.innerHTML
						}
					});
				resolve(projects);
			}
		}]);
	});
}

module.exports = connector;