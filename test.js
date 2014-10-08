var vpConnector = require('./data/apiConnector/vpConnector.js'),
	log = require('./log.js'),
	Set = require('simplesets').Set,
	htmlparser = require("htmlparser2");

var set = new Set();
var result = "";
var parser = new htmlparser.Parser({
    ontext: function(text){
        result += text;
    },
    onend: function(){
    	result = result.replace("Où en est-on ?", "");
    	result = result.replace(/[\s]*Sur la toile publique[\s\S]*/, "");
    	console.log(result);
    }
},
{
	decodeEntities: true
});

vpConnector.getSummaries().then(function(entries){
	parser.write(entries[0].content);
	parser.end();
	
}).catch(log);
