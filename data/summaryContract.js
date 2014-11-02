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
	if( "constraint" in this && "primaryKey" in this.constraint ){
		result += "PRIMARY KEY (";
		for( i in this.constraint.primaryKey ){
			result += this.constraint.primaryKey[i] + ", ";
		}
		result = result.substring(0, result.length - 2) + "), ";
	}
	result = result.substring(0, result.length - 2) + ");";
	return result;
}

contract.speech = new Contract({
	tableName: "speech",
	columns: [{
		name: "_id",
		type: "SERIAL PRIMARY KEY"
	},
	{
		name: "law_url",
		type: "TEXT NOT NULL"
	},
	{
		name: "speech",
		type: "TEXT NOT NULL"
	},
	{
		name: "orator",
		type: "TEXT NOT NULL"
	},
	{
		name: "plt_group",
		type: "TEXT NOT NULL"
	},
	{
		name:"debate_section",
		type:"TEXT NOT NULL"
	},
	{
		name:"rated_sentences",
		type:"INTEGER",
	},
	{
		name:"positive",
		type:"DECIMAL"
	},
	{
		name:"negative",
		type:"DECIMAL"
	},
	{
		name:"useless",
		type:"DECIMAL"
	},
	{
		name:"rating",
		type: "TEXT"
	}],
	constraint: {
		foreignKey: {
			key: ["law_url"],
			referenceTable: "law",
			referenceKeys: ["url"]
		},
		unique: ["law_url", "orator", "plt_group", "debate_section"]
	}
});

contract.law = new Contract({
	tableName: "law",
	columns: [
	{
		name: "_id",
		type: "SERIAL"
	},
	{
		name: "law_title",
		type: "TEXT NOT NULL"
	},
	{
		name: "summary",
		type: "TEXT NOT NULL"
	},
	{
		name: "content",
		type: "TEXT NOT NULL"
	},
	{
		name: "url",
		type: "TEXT NOT NULL"
	},
	{
		name: "date",
		type: "TIMESTAMP NOT NULL"
	},{
		name: "status",
		type: "INTEGER NOT NULL"
	},
	{
		name: "tags",
		type: "TEXT NOT NULL"
	},
	{
		name: "parliament_folder_url",
		type: "TEXT"
	},
	{
		name: "nd_folder_url",
		type: "TEXT"
	},
	{
		name: "nd_law_title",
		type: "TEXT"
	}
	],
	constraint: {
		primaryKey: ["url"]
	}
});

contract.corpus = new Contract({
	tableName: "corpus",
	columns: [
	{
		name: "_id",
		type: "SERIAL"
	},
	{
		name: "sentence",
		type: "TEXT NOT NULL"
	},
	{
		name: "lemma_sentence",
		type: "TEXT NOT NULL"
	},
	{
		name: "relevance",
		type: "DECIMAL"
	},
	{
		name: "sentiment",
		type: "DECIMAL"
	},
	{
		name: "information",
		type: "TEXT"
	}],
	constraint: {
		unique: ["sentence"]
	}
})

module.exports = contract;