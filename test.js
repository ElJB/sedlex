var url = require("url");

var u = url.format({
	query: {
		bla: "mop"
	}
});
console.log(u);