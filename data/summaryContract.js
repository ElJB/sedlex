var debug = require('../debug.js'),
	contract = {},
	mysqlHelper = require('mysql-helper'),
	Q = require('q');

contract.tables = {};
var mysql = new mysqlHelper({
	connectionLimit : 10,
	host            : 'localhost',
	user            : 'root',
	password        : '',
	database		: 'test'
});
var Contract = mysql.Contract;

function getTables(){
	return mysql.execSQL("SHOW TABLES");
}

contract.tables.law = new Contract({
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
		type: "VARCHAR(200) NOT NULL"
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

contract.insert = function insert(uri, columns, data){
	return mysql.insert(getTableFromUri(uri), columns, data);
}

contract.upsert = function upsert(uri, columns, data){
	return mysql.upsert(getTableFromUri(uri), columns, data);
}

contract.lawMaxDate = function lawMaxDate(){
	return mysql.execSQL("SELECT max(date) FROM law");
}

contract.updateLawWithND = function updateLawWithND(project){
	return mysql.update("law", ["nd_folder_url", "nd_law_title"], [project.url, project.title],
			"(nd_folder_url IS NULL OR nd_law_title IS NULL) AND lower(parliament_folder_url) LIKE lower(?)", fuzzyUrlMatch(project.pltUrl));
}

function fuzzyUrlMatch(url){
	return "%" + url.match(/dossiers\/([^\.]+)\.asp/)[1] + "%";
}

function getTableFromUri(uri){
	return /\/(\w+)/.exec(uri)[1];
}

getTables()
.then(function(result){
	var tables = Object.keys(contract.tables),
		existing = result[0].map(function(e){
			for( key in e ){
				return e[key];
			}
		});

	var promises = []
	for( i in tables ){
		if( existing.indexOf(tables[i]) == -1 ){
			promises.push(mysql.execSQL(contract.tables[tables[i]].createTableString()));
		}
	}

	return Q.all(promises);
})
.catch(log);

function log(e){
	console.log(e.stack);
}

module.exports = contract;