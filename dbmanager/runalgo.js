var helper = require("../app/model_helpers");
var async = require("async");

firstPass();

function firstPass() {
    console.log("FirstPass");
    var proc_name = "FindAllRequests";
    var a_proc_name = "AddStudentToSASClass";
    var a_query = "";
    var query = helper.buildProcQuery(proc_name, []);
    helper.pool.getConnection(function(error, connection) {
        helper.processError(error);
        var r_query = connection.query(query);
        var query_list = [];
        r_query
            .on("error", function(error) {
                throw error;
            })
            .on("result", function(row) {
                var student_id = row.student_id;
                var teacher_id = row.sas_teacher_id;
                if (row && row.rank != 0) {
                    var params = [student_id, teacher_id];
                    a_query += helper.buildProcQuery(a_proc_name, params);
                }
            })
            .on("end", function() {
                console.log("At end.");
                helper.query(a_query, function(error, results) {
                    secondPass();
                });
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
