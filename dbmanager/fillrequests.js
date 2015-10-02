var helper = require("../app/model_helpers");

const P_TEACHER_REQ = 0.005;
const P_STUDENT_REQ = 0.75;

getTeachers();

function getTeachers() {
    console.log("GetTeachers");
    var proc_name = "FindAllTeachers";
    helper.runProc(proc_name, [], function(error, results) {
        sendTeacherRequests(results);
    });
}

function sendTeacherRequests(teachers) {
    console.log("SendTeacherRequests");
    var s_proc_name = "FindStudentsForTeacher";
    var query = "";
    for (var t = 0; t < teachers.length; t++) {
        var teacher = teachers[t];
        query += helper.buildProcQuery(s_proc_name, [teacher.id]);
        if (t < teachers.length - 1) query += "\n";
    }
    helper.fullQuery(query, function(error, results) {
        var r_proc_name = "AddSASRequest";
        query = "";
        for (var r = 0; r < results.length; r += 2) {
            var teacher = teachers[r / 2];
            var students = results[r];
            for (var s = 0; s < students.length; s++) {
                var student = students[s];
                if (Math.random() < P_TEACHER_REQ) {
                    // Make request for student
                    var params = [student.id, teacher.id, -1];
                    query += helper.buildProcQuery(r_proc_name, params);
                    query += "\n";
                }
            }
        }
        helper.query(query, function(error, results) {
            getStudents();
        });
    });
}

function getStudents() {
    console.log("GetStudents");
    var proc_name = "FindAllStudents";
    helper.runProc(proc_name, [], function(error, results) {
        sendStudentRequests(results);
    });
}

function sendStudentRequests(students) {
    console.log("SendStudentRequests");
    var t_proc_name = "FindTeachersForStudent";
    var query = "";
    for (var s = 0; s < students.length; s++) {
        var student = students[s];
        query += helper.buildProcQuery(t_proc_name, [student.id]);
        if (s < students.length - 1) query += "\n";
    }
    helper.fullQuery(query, function(error, results) {
        var r_proc_name = "AddSASRequest";
        query = "";
        for (var r = 0; r < results.length; r += 2) {
            var teachers = results[r];
            var student = students[r / 2];
            for (var t = 0; t < teachers.length; t++) {
                var teacher = teachers[t];
                if (Math.random() < P_STUDENT_REQ) {
                    // Make request for teacher 
                    var rank = randomInt(0, teachers.length);
                    var params = [student.id, teacher.id, rank]
                    query += helper.buildProcQuery(r_proc_name, params);
                    query += "\n";
                }
            }
        }
        helper.query(query, function(error, results) {
            finish();
        });
    });
}

function finish() {
    console.log("Successfully filled requests.");
    process.exit();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
