var debug = false;
if (process.argv[2] && process.argv[2] == "debug") {
    debug = true;
}

var mysql = require("mysql");
var config = require("./config/database")
var connection = mysql.createConnection(config);

var weights = {
    timestamp: 0.5,
    student_rank: 0.5,
    teacher_rank: 0.5
};

connection.connect();

resolveTeacherConflicts(function() {

});

function resolveTeacherConflicts(next) {
    var query = "SELECT "
                + "sas_requests.id AS id, "
                + "student_classes.student_id AS student_id "
                + "FROM sas_requests "
                + "JOIN student_classes ON sas_requests.user_class_id = student_classes.id "
                + "WHERE sas_requests.rank = -1 "
                + "ORDER BY timestamp ASC";

    connection.query(query, function(error, rows, fields) {
        processError(error, query);
        var request_ids = [];
        if (debug) log(rows, "rows");
        for (var ro = 0; ro < rows.length - 1; ro++) {
            if (request_ids.indexOf(rows[ro]) > -1) continue;
            for (var ri = ro + 1; ri < rows.length; ri++) {
                if (rows[ro].student_id == rows[ri].student_id) {
                    request_ids.push(rows[ri].id);
                }
            }
        }
        if (debug) log(request_ids, "removed");
        var query_object = {
            table: "sas_requests",
            removed: request_ids
        };
        remove(query_object, function(messages) {
            next();
        });
    });
}

function processError(error, query) {
    if (error) {
        log(error, "error");
        log(query, "query");
        process.exit();
    }
}

function log(query, type) {
    type = type.toUpperCase();
    console.log();
    console.log("===============" + type + "===============");
    console.log(query);
    console.log("=============END " + type + "=============");
    console.log();
}

function remove(query_object, callback) {
    var messages = [];
    var query = "DELETE "
                + "FROM " + query_object.table + " "
                + "WHERE id=";
    var query_values = [];
    var removed = query_object.removed;
    for(var r = 0; r < removed.length; r++) {
        query += "?";
        if (r < removed.length - 1) {
            query += " OR id="
        }
    }
    query = mysql.format(query, removed);
    connection.query(query, function(error, rows, fields) {
        processError();
        if (debug) log(rows, "delete query result");
        callback(messages);
    });
}