//TO DO: test post requet
var ttConnector = require('../data/apiConnector/textTeaserConnector.js'),
	log = require('../log.js');

/*var text = "TextTeaser is a service that creates tl;dr (too long; didn't read) summaries for \
lengthly online articles. Available as a Web service and API on Mashape, TextTeaser's developers \
also want to turn it into the \"imgur of text summarization\" by making a platform for users to \
upload summaries of their favorite articles. The service was created by Jolo Balbin as part of his graduate research..."*/

var text = "Text to summarize";

ttConnector.postText(text)
	.then(ttConnector.getText)
	.then(console.log)
	.catch(log);