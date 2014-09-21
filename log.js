module.exports = function(err){
	if( err instanceof Error){
		console.log(err.stack);
	}
}