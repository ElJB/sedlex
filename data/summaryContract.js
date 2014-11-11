var debug = require('../debug.js'),
	contract = {},
	pgHelper = require('pg-helper');

var pg = new pgHelper();
var Contract = pg.Contract;

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