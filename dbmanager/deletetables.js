const ideal_tables = ["sas_classes", "schools", "classes", "sas_requests", "student_classes", "users"];
const tables = ["users", "classes", "student_classes", "sas_requests"];

var arg = process.argv[2];
var del_tables = tables;

if (arg == "ideal") {
    console.log("Deleting ideal database.");
    del_tables = ideal_tables; 
} else {
    console.log("Deleting non-ideal database.");
}

var config = require("../config/database");
var mysql = require("mysql");
var fs = require("fs");
config.multipleStatements = true;
var connection = mysql.createConnection(config);
connection.connect();

var set_query = "SET FOREIGN_KEY_CHECKS = 0;";
var del_query = "DROP TABLE ";
var uns_query = "SET FOREIGN_KEY_CHECKS = 1;";

for (var t = 0; t < del_tables.length; t++) {
    del_query += del_tables[t];
    if (t < del_tables.length - 1) del_query += ", ";
}
del_query += ";";
var query = set_query + " " + del_query + " " + uns_query;

connection.beginTransaction(function(error) {
    if (error) throw error;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            return connection.rollback(function(error) { if (error) throw error; });
        }
        console.log("Successfully deleted tables.");
        process.exit();
    });
});
