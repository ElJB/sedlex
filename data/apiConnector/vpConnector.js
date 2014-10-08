var Crawler = require("crawler").Crawler,
	debug = require('../../debug.js'),
	log = require('../../log.js'),
	connector = {},
	Q = require('Q'),
	parseXml = require('xml2js').parseString,
	htmlparser = require("htmlparser2");

var statusMap = {
	'depot-au-parlement_projet': 2,
	'promulgation_proposition': 9,
	'promulgation-signature_ordonnance': 14,
	'examen_projet': 3,
	'promulgation_projet': 4,
	'conseil-des-ministres_projet': 1,
	'examen_proposition': 8,
	'conseil-ministres_ordonnance': 12,
	'decret-application_projet': 5,
	'decret-application_proposition': 10,
	'evaluation_projet': 6,
	'loi-ratification_ordonnance': 13,
	'depot-au-parlement_proposition': 7,
	'evaluation_proposition': 11
}

var htmlParser = new htmlparser.Parser({
    ontext: function(text){
        parseResult += text;
    },
    onend: function(){
    	parseResult = parseResult.replace("Où en est-on ?", "");
    	parseResult = parseResult.replace(/[\s]*Sur la toile publique[\s\S]*/, "");
    }
},
{
	decodeEntities: true
}),
	parseResult = "";

var parseHTML = function(html){
	parseResult = "";
	htmlParser.write(html);
	htmlParser.end();
	htmlParser.reset();
	return parseResult;
}

var crawler = new Crawler({
		"maxConnections":10
	}),
		vpUri = "http://www.vie-publique.fr/spip.php?page=rdp_viepubliquefr_panorama_atom";

var entryToObj = function(entry){
	//TO DO: find a way to keep bullet lists in content
	//TO DO: include additional reading material as an attribute 
	var result = {};

	var keys = ["content", "summary"];
	for( i in keys ){
		result[keys[i]] = entry[keys[i]][0]._;
	}

	result.content = parseHTML(result.content);

	keys = ["title", "updated"]
	for( i in keys ){
		result[keys[i]] = entry[keys[i]][0]
	}
	result.date = result.updated;
	result.url = entry.link[0].$.href;

	result.tags = [];
	for( i in entry.category ){
		if( entry.category[i].$.term[0] == entry.category[i].$.term[0].toUpperCase() ){
			result.tags.push(entry.category[i].$.term);
		} else {
			result.status = statusMap[entry.category[i].$.term];
			if( !result.status ){ throw new Error("Unknown law project status: " + entry.category[i].$.term); }
		}
	}

	return result;
}

connector.getSummaries = function(){
	return Q.promise(function(resolve, reject, notify){
		crawler.queue([{
			"uri": vpUri,
			"callback": function(err, result, $) {
				if( err ){ return reject(err); }
				parseXml(result.body, function(err, result){
					if( err ){ return reject(err); }
					resolve(result.feed.entry.map(entryToObj));
				});
			}
		}]);
	});
}

module.exports = connector;