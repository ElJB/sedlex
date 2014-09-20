var Crawler = require("crawler").Crawler,
	path = require('path'),
	url = require('url'),
	debug = require('../../debug.js'),
	log = require('../../log.js'),
	connector = {},
	assert = require('assert'),
	Q = require('Q');

var lawProjectRegex = /^pjl|^ppl/,
	extractLawFromUrl = /([^\/]+)\/viz\/interventions.json$/;

var crawler = new Crawler({
		"maxConnections":10
	}),
		folderUri = "http://www.lafabriquedelaloi.fr/api/";

connector.loadTree = function(){
	return Q.promise(function(resolve, reject, notify){
		//TO DO refactor to get project list from "dossiers" folder
		//TO DO add a resolve with the full list built
		crawler.queue([{
			"uri": folderUri,
			"callback": function(err, result, $) {
				if(err){
					console.log("RC API crawler error: " + err);
					callback(err);
				} else {
					var tree = $("table a").map(function(i, a){
						return a.innerHTML;
					}).filter(function(i, a){
						return lawProjectRegex.exec(a);
					})

					console.log(tree.length + " law projects");

					tree.each(buildInterventionUrl);
				}
			}
		}]);

		var buildInterventionUrl = function(i, a){
			var debateUrl = url.resolve(folderUri, path.join(a, 'viz', 'interventions.json'));

			crawler.queue([{
				"uri": debateUrl,
				"jQuery":false,
				"callback": getInterventionJson
			}]);
		}

		var getInterventionJson = function(err, result) {
			if(err){
				reject(err);
			} else {
				debug("Grabbed " + result.body.length + " bytes for " + extractLawFromUrl.exec(result.uri)[1]);
				notify([extractLawFromUrl.exec(result.uri)[1],
					new Debates(result.body)]);
			}
		}
	});
}

var Group = function(groupSource){
	var self = this;
	this.orators = groupSource["orateurs"];
	this.length = Object.keys(this.orators).length;
	this.getOratorByLengthUri = function(number){
		var key = Object.keys(self.orators).sort(function(a, b){
			return (a.nb_mots - b.nb_mots) * -1;
		})[number];
		return self.orators[key].link;
	}
}

var Division = function(divisionSource, name){
	var self = this;
	this.name = name;
	this.order = divisionSource.order;
	this.date = divisionSource.first_date;
	this.groups = divisionSource["groupes"];
	this.length = Object.keys(this.groups).length;
	this.hasGroup = function(group){
		return group in self.groups;
	};
	this.getGroup = function(group){
		if( !self.hasGroup(group) ){ return; };
		if( !(self.groups[group] instanceof Group) ){
			self.groups[group] = new Group(self.groups[group]);
		}
		return self.groups[group];
	};
}

var Audience = function(audienceSource, name){
	var self = this;
	this.name = name;
	this.divisions = audienceSource["divisions"];
	this.length = Object.keys(this.divisions).length;
	this.getDivision = function(number){
		//TO DO function not working, to be checked
		var key = Object.keys(self.divisions).sort(function(a, b){
			return self.divisions[a].order - self.divisions[b].order;
		})[number];
		if( !(self.divisions[key] instanceof Division) ){
			self.divisions[key] = new Division(self.divisions[key], key);
		};
		return self.divisions[key];
	};
}

var Debates = function(jsonSource){
	var self = this;
	this.debates = JSON.parse(jsonSource);
	this.length = Object.keys(this.debates).length;
	this.getAudience = function(number){
		if( !self.length ){ return; };
		var key = Object.keys(self.debates).sort()[number];
		if( !(self.debates[key] instanceof Audience) ){
			self.debates[key] = new Audience(self.debates[key], key);	
		};
		return self.debates[key];
	}
}

if( process.env.DEBUG ){
	connector.Audience = Audience;
	connector.Debates = Debates;
	connector.extractLawFromUrl = extractLawFromUrl;
}


module.exports = connector;