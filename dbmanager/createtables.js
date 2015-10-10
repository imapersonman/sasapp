var mysql = require("mysql");
var fs = require("fs");

var config = require("../config/database");
// Enables multiple statements so the entire file can be run.
config.multipleStatements = true;

var connection = mysql.createConnection(config);
connection.connect();

var file = "new_schema.sql";

var query_file = fs.readFileSync(file);
var query = query_file.toString();

connection.query(query, function(error, rows, fields) {
    if (error) {
        console.log(error);
    }else {
        console.log("Successfully created tables.")
    }
});
connection.end();

function logQuery(query) {
    console.log();
    console.log("==========QUERY==========");
    console.log(query);
    console.log("========END QEURY========");
    console.log();
}
