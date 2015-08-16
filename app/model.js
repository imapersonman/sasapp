var mysql = require("mysql");
var config = require("../config/database");
config.connectionLimit = 20;
var pool = mysql.createConnection(config);
var helper = require("model_helpers");

exports.findUserForGoogle = function(google_id, callback) {
    var esc_google_id = mysql.escape(google_id);
    var query = "CALL FindUserForGoogle(" + esc_google_id + ");";
    helper.query(query, pool, function(results) {
        callback(results[0]);
    });
};

exports.findUserByEmail = function(email, callback) {
    var esc_email = mysql.escape(email);
    var query = "CALL FindUserByEmail(" + esc_email + ");";
    helper.query(query, pool, function(results) {
        callback(results[0]);
    });
};

exports.firstLogin = function(google_id, token, email, callback) {
    var esc_google_id = mysql.escape(google_id);
    var esc_token = mysql.escape(token);
    var esc_email = mysql.escape(email);
    var query = "CALL FirstLogin("   + esc_google_id + ", "
                                + esc_token + ", "
                                + esc_email + ");";
    helper.query(query, pool, function(results) {
        var user = {};
        user.google_id = google_id;
        user.token = token;
        user.email = email;
        callback(user);
    });
};

exports.findAllUsers = function(callback) {
    var query = "CALL FindAllUsers()";
    helper.query(query, pool, callback);
};

exports.findStudentsForClass = function(class_id, callback) {
    var esc_class_id = mysql.escape(class_id);
    var query = "CALL FindStudentsForClass(" + esc_class_id + ");";
    helper.query(query, pool, callback);
};

exports.findStudentsForTeacher = function(teacher_id, callback) {
    var proc_name = "FindStudentsForTeacher";
    var params = [teacher_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findTeachersForStudent = function(student_id, callback) {
    var proc_name = "FindTeachersForStudent";
    var params = [student_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findRankingsForStudent = function(student_id, callback) {
    var proc_name = "FindRankingsForStudent";
    var params = [student_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findRankingsForTeacher = function(teacher_id, callback) {
    var proc_name = "FindRankingsForTeacher";
    var params = [teacher_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findAllStudents = function(callback) {
    var proc_name = "FindAllStudents";
    helper.runProc(proc_name, [], pool, callback);
};

exports.findAllTeachers = function(callback) {
    var proc_name = "FindAllTeachers";
    helper.runProc(proc_name, [], pool, callback);
};

exports.findClass = function(class_id, callback) {
    var proc_name = "FindClass";
    var params = [class_id];
    helper.runProc(proc_name, params, pool, function(results) {
        callback(results[0]);
    });
};

exports.findAllClasses = function(callback) {
    var proc_name = "FindAllClasses";
    helper.runProc(proc_name, [], pool, callback);
};

exports.findAllSASClasses = function(callback) {
    var proc_name = "FindAllSASClasses";
    helper.runProc(proc_name, [], pool, callback);
};

exports.findSASClass = function(teacher_id, callback) {
    var proc_name = "FindSASClass";
    var params = [teacher_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findStudentsForSASClass = function(teacher_id, callback) {
    var proc_name = "FindStudentsForSASClass";
    var params = [teacher_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.findAllSchools = function(callback) {
    var proc_name = "FindAllSchools";
    helper.runProc(proc_name, [], pool, callback);
};

// TODO(koissi): Add ability to build procedure call queries.
// TODO(koissi): Enable multi-statement queries.
exports.addStudents(added, callback) {
    var proc_name = "AddStudent";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.email];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

exports.addTeachers(added, callback) {
    var proc_name = "AddTeacher";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.email, st.room_num];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

exports.addClasses(c_name, c_room_num, c_period, callback) {
    var proc_name = "AddClass";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.room_num, st.period];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

exports.addSchools(added, callback) {
    var proc_name = "AddSchool";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.sas_name];
        query += helper.buildProc(proc_name, params) + " " ;
    }
    helper.query(query, pool, callback);
};

// TODO(koissi): Rewrite to reflect Proc SAS Schema
exports.addStudentsToClass(class_id, added, callback) {
    var proc_name = "AddStudentToClass";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [class_id, st.student_id];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

exports.addSASRequests = function(ranks, callback) {
    var proc_name = "AddSASRequest";
    var query = "";
    for (r = 0; r < ranks.length; r++) {
        var st = ranks[r];
        var params = [st.student_id, st.rank];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

exports.addTeacherSASRequests = function(students, callback) {
    var proc_name = "AddSASRequest";
    var query = "";
    for (var s = 0; s < students.length; s++) {
        var st = students[s];
        var params = [st.id, "-1"];
        query += helper.buildProc(proc_name, params) + " ";
    }
    helper.query(query, pool, callback);
};

// TODO(koissi): Updates.
