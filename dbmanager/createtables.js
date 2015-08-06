var arg = process.argv[2];
var file = "tables.txt";

if (arg == "ideal") {
    console.log("Building ideal database.");
    file = "ideal_schema.sql";
} else {
    console.log("Building non-ideal database.");
}

var config = require("../config/database");
var mysql = require("mysql");
var fs = require("fs");
config.multipleStatements = true;
var connection = mysql.createConnection(config);
connection.connect();

var query_file = fs.readFileSync(file);
var query = query_file.toString();

connection.query(query, function(error, rows, fields) {
    if (error) {
        console.log(error);
        logQuery(query);
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
