var helper = require("../app/model_helpers");
var async = require("async");

firstPass();

/*
function getRequests() {
    var proc_name = "FindAllRequests";
    helper.runProc(proc_name, [], function(error, results) {
        sortRequests(results);
    });
}

function sortRequests(requests) {
    var proc_name = "AddStudentToSASClass";
    var query = "";
    for (var r = 0; r < something else; r++) {
        var request = requests[r];
        console.log("Request: " + request);
        var student_id = request.student_id;
        var teacher_id = request.sas_teacher_id;
        var params = [student_id, teacher_id];
        if (request.rank == 0) continue;
        query += helper.buildProcQuery(proc_name, params);
        requests.filter(function(element, index, array) {
            var s_id = element.student_id;
            return (s_id != student_id);
        });
    }
}

function firstPass() {
    var proc_name = "FindAllRequests";
    var a_proc_name = "AddStudentToSASClass";
    var a_query = "";
    var query = helper.buildProcQuery(proc_name, []);
    // I FORGOT CAPS!
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
                var teacher_id = row.teacher_id;
                if (deleted.indexOf(teacher_id) > -1 || row.rank != 0) {
                    var params = [student_id, teacher_id];
                    query_list.push(function(callback) {
                        helper.runProc(a_proc_name, params, callback);
                    });
                }
            })
            .on("end", function() {
                async.series(query_list, function(error, results) {
                    if (error) throw error;
                    secondPass();
                });
            });
    });
}

function secondPass() {
    var s_proc_name = "FindFreeStudents";
    var t_proc_name = "FindFreeSASClasses";
    helper.runProc(t_proc_name, [], function(error, results) {
        var teachers = results;
        helper.runProc(s_proc_name, [], function(error, results) {
            var students = results;
            for (var s = 0; s < students.length; s++) {
                var student = students[s];
                do {
                    var teacher 
                } while(1);
            }
        });
    });
}
*/

function firstPass() {
    var s_proc_name = "FindAllStudentsForSorting";
    helper.runProc(s_proc_name, [], function(error, results) {
        for (var r = 0; r < 10; r++) {
            console.log("Result: " + JSON.stringify(results[r]));
        }
    });
}

function finish() {
    console.log("Successfully sorted students");
    process.exit();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
