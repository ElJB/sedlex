var debug = require('../debug.js'),
	contract = {};

var Contract = function(source){
	for( key in source ){
		this[key] = source[key];
	}
}

Contract.prototype.getColumns = function(){
	return this.columns.filter(function(e){
		return e.type.match(/SERIAL/) == null;
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
		result = result.substring(0, result.length - 2) + "), ";
	}
	if( "constraint" in this && "foreignKey" in this.constraint ){
		result += "FOREIGN KEY (";
		for( i in this.constraint.foreignKey.key ){
			result += this.constraint.foreignKey.key[i] + ", ";
		}
		result = result.substring(0, result.length - 2) + ") REFERENCES ";
		result += this.constraint.foreignKey.referenceTable + "(";
		for( i in this.constraint.foreignKey.referenceKeys ){
			result += this.constraint.foreignKey.referenceKeys[i] + ", ";
		}
		result = result.substring(0, result.length - 2) + "), ";
	}
	result = result.substring(0, result.length - 2) + ");";
	debug(result);
	return result;
}

contract.speech = new Contract({
	tableName: "speech",
	columns: [{
		name: "_id",
		type: "SERIAL PRIMARY KEY"
	},
	{
		name: "url",
		type: "TEXT NOT NULL"
	},
	{
		name: "text",
		type: "TEXT NOT NULL"
	},
	{
		name: "rc_ref",
		type: "TEXT NOT NULL"
	},
	{
		name: "date",
		type: "DATE NOT NULL"
	},
	{
		name: "interventions_count",
		type: "INTEGER NOT NULL"
	},
	{
		name: "words_count",
		type: "INTEGER NOT NULL"
	},
	{
		name:"audience_n",
		type:"INTEGER NOT NULL"
	},
	{
		name:"lecture",
		type:"TEXT NOT NULL"
	},
	{
		name:"house",
		type:"TEXT NOT NULL"
	},
	{
		name:"commission",
		type:"BOOLEAN NOT NULL"
	}],
	//TO DO add columns about intervention order in division and division in audience
	constraint: {
		unique: ["url"]
	}
});

contract.summary = new Contract({
	tableName: "summarize",
	columns: [{
		name: "_id",
		type: "SERIAL PRIMARY KEY"
	},
	{
		name: "speech_id",
		type: "INTEGER NOT NULL"
	},
	{
		name: "model",
		type: "TEXT NOT NULL"
	},
	{
		name: "model_param",
		type: "TEXT NOT NULL"
	},
	{
		name: "summary",
		type: "TEXT NOT NULL"
	}],
	constraint: {
		foreignKey: {
			key: ["speech_id"],
			referenceTable: "speech",
			referenceKeys: ["_id"]
		}
	}
});

module.exports = contract;