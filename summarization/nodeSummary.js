var SummaryTool = require('node-summary'),
	Q = require('q'),
	pg = require('../data/postgresHelper.js')
	log = require('../log.js');

var textPromise = pg.queryPromise("SELECT source_text FROM source WHERE rc_ref = 'ppl13-007';");

textPromise.then(function(result){
	var content = result.rows[0].source_text,
		title = "";

	SummaryTool.getSortedSentences(content, 10, function(err, summary) {
	    if(err) console.log("Something went wrong man!");

	    console.log(summary);

	    console.log("Original Length " + (title.length + content.length));
	    console.log("Summary Length " + summary.length);
	    console.log("Summary Ratio: " + (100 - (100 * (summary.length / (title.length + content.length)))));
	});
}).catch(log);

