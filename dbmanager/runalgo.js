var helper = require("../app/model_helpers");
var mysql = require("mysql");
var config = require("../config/database");
var async = require("async");

var connection = mysql.createConnection(config);
connection.connect();

firstPass();

function firstPass() {
    console.log("FirstPass");
    var proc_name = "FindAllRequests";
    var a_proc_name = "AddStudentToSASClass";
    var query = helper.buildProcQuery(proc_name, []);
    var r_query = connection.query(query);
    var count = 0;
    var query_list = [];
    r_query
        .on("error", function(error) {
            throw error;
        })
        .on("result", function(row) {
            count++;
            var student_id = row.student_id;
            var teacher_id = row.sas_teacher_id;
            if (row && row.rank != 0) {
                var params = [student_id, teacher_id];
                var s_query = helper.buildProcQuery(a_proc_name, params);
                connection.query(query, function(error, results) {
                    if (error) throw error;
                    console.log("Finished query");
                });
            }
        })
        .on("end", function() {
            console.log("Count: " + count);
            console.log("At end.");
            connection.end(function(error) {
                secondPass();
            });
        });
}

function secondPass() {
    console.log("SecondPass");
    var proc_name = "FinishAssignment";
    helper.runProc(proc_name, [], function(error, results) {
        finish();
    });
}

function finish() {
    console.log("Successfully sorted students");
    process.exit();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
