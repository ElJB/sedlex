module.exports = function(err){
	if( process.env.DEBUG ){
		console.log(err);
		if( err.__proto__.name == "Error" ){
			console.log(err.stack);
		}
	}
}