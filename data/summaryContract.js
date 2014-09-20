var contract = {};

var Contract = function(source){
	for( key in source ){
		this[key] = source[key];
	}
}

Contract.prototype.getColumns = function(){
	return this.columns.filter(function(e){
		return e.type != "SERIAL";
	}).map(function(e){
		return e.name;
	});
}

Contract.prototype.createDbString = function(){
	var result = "CREATE TABLE " + this.tableName + " (";
	for( i in this.columns ){
		result += this.columns[i].name + " " + this.columns[i].type + ", "; 
	}
	if( "constraint" in this && "unique" in this.constraint ){
		result += "UNIQUE (";
		for( i in this.constraint.unique ){
			result += this.constraint.unique[i] + ", ";
		}
	}
	result = result.substring(0, result.length - 2) + "));";
	return result;
}

contract.source = new Contract({
	tableName: "source",
	columns: [{
		name: "_id",
		type: "SERIAL"
	},
	{
		name: "source_url",
		type: "TEXT NOT NULL"
	},
	{
		name: "source_text",
		type: "TEXT NOT NULL"
	},
	{
		name: "rcRef",
		type: "TEXT NOT NULL"
	},
	{
		name: "date",
		type: "DATE NOT NULL"
	}],
	constraint: {
		unique: ["source_url"],
		foreignKey: ""
		//TO DO: add foreign key
	}
});


//TO DO update summary contract with types
contract.summary = new Contract({
	tableName: "summarize",
	columns: [{
		name: "_id",
	},
	{
		name: "source_id"
	},
	{
		name: "model"
	},
	{
		name: "model_param"
	},
	{
		name: "summary"
	}]
});

module.exports = contract;