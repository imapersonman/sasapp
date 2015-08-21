var mysql = require("mysql");
var config = require("../config/database");
config.connectionLimit = 20;
config.multipleStatements = true;
var pool = mysql.createPool(config);
var helper = require("./model_helpers");

exports.findUserForGoogle = function(google_id, callback) {
    var esc_google_id = mysql.escape(google_id);
    var query = "CALL FindUserForGoogle(" + esc_google_id + ");";
    helper.query(query, pool, function(error, results) {
        callback(error, results[0]);
    });
};

exports.findUserByEmail = function(email, callback) {
    var esc_email = mysql.escape(email);
    var query = "CALL FindUserByEmail(" + esc_email + ");";
    helper.query(query, pool, function(error, results) {
        callback(error, results[0]);
    });
};

exports.firstLogin = function(google_id, token, email, callback) {
    var esc_google_id = mysql.escape(google_id);
    var esc_token = mysql.escape(token);
    var esc_email = mysql.escape(email);
    var query = "CALL FirstLogin("   + esc_google_id + ", "
                                + esc_token + ", "
                                + esc_email + ");";
    helper.query(query, pool, function(error, results) {
        var user = {};
        user.google_id = google_id;
        user.token = token;
        user.email = email;
        callback(error, user);
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
    console.log("In FindAllStudents");
    helper.runProc(proc_name, [], pool, callback);
};

exports.findAllTeachers = function(callback) {
    var proc_name = "FindAllTeachers";
    helper.runProc(proc_name, [], pool, callback);
};

exports.findClass = function(class_id, callback) {
    var proc_name = "FindClass";
    var params = [class_id];
    helper.runProc(proc_name, params, pool, function(error, results) {
        console.log("Results: " + JSON.stringify(results[0]));
        callback(error, results[0]);
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
exports.addStudents = function(added, callback) {
    var proc_name = "AddStudent";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.email];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (a < added.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.addTeachers = function(added, callback) {
    var proc_name = "AddTeacher";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.email, st.room_num];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (a < added.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.addClasses = function(added, callback) {
    var proc_name = "AddClass";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.room_num, st.period];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (a < added.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.addSchools = function(added, callback) {
    var proc_name = "AddSchool";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [st.name, st.sas_name];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (a < added.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

// TODO(koissi): Rewrite to reflect Proc SAS Schema
exports.addStudentsToClass = function(class_id, added, callback) {
    var proc_name = "AddStudentToClass";
    var query = "";
    for (var a = 0; a < added.length; a++) {
        var st = added[a];
        var params = [class_id, st];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (a < added.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.addSASRequests = function(ranks, callback) {
    var proc_name = "AddSASRequest";
    var query = "";
    for (r = 0; r < ranks.length; r++) {
        var st = ranks[r];
        var params = [st.student_id, st.teacher_id, st.rank];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < ranks.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.addTeacherSASRequests = function(students, callback) {
    var proc_name = "AddSASRequest";
    var query = "";
    for (var s = 0; s < students.length; s++) {
        var st = students[s];
        var params = [st.id, "-1"];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (s < students.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

// TODO(koissi): Updates.
exports.updateStudents = function(updates, callback) {
    var proc_name_n = "UpdateStudentName";
    var proc_name_e = "UpdateStudentEmail";
    var proc_name_s = "UpdateStudentSchool";
    var query = "";
    var ids = Object.keys(updates);
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var st = updates[id];
        var params_n = [id, st.name];
        var params_e = [id, st.email];
        var params_s = [id, st.school_id];
        if (st.name) query += helper.buildProcQuery(proc_name_n, params_n, pool);
        if (st.email) query += helper.buildProcQuery(proc_name_e, params_e, pool);
        if (st.school_id) query += helper.buildProcQuery(proc_name_s, params_s, pool);
        if (i < updates.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.updateTeachers = function(updates, callback) {
    var proc_name_n = "UpdateUserName";
    var proc_name_e = "UpdateUserEmail";
    var proc_name_s = "UpdateUserSchool";
    var proc_name_r = "UpdateTeacherRoom";
    var query = "";
    var ids = Object.keys(updates);
    var h = helper;
    for (var i = 0; o < ids.length; i++) {
        var id = ids[i];
        var st = updates[id];
        var params_n = [id, st.name];
        var params_e = [id, st.email];
        var params_s = [id, st.school_id];
        var params_r = [id, st.room_num];
        if (st.name) query += h.buildProcQuery(proc_name_n, params_n, pool);
        if (st.email) query += h.buildProcQuery(proc_name_e, params_e, pool);
        if (st.school_id) query += h.buildProcQuery(proc_name_s, params_s, pool);
        if (st.room_num) query += h.buildProcQuery(proc_name_r, params_r, pool);
        if (i < updates.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.updateClasses = function(updates, callback) {
    console.log("Updates: " + JSON.stringify(updates));
    var proc_name_n = "UpdateClassName";
    var proc_name_r = "UpdateClassRoom";
    var proc_name_p = "UpdateClassPeriod";
    var query = "";
    var ids = Object.keys(updates);
    var h = helper;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var st = updates[id];
        var params_n = [id, st.name];
        var params_r = [id, st.room_num];
        var params_p = [id, st.period];
        if (st.name) query += h.buildProcQuery(proc_name_n, params_n, pool);
        if (st.room_num) query += h.buildProcQuery(proc_name_r, params_r, pool);
        if (st.period) query += h.buildProcQuery(proc_name_p, params_p, pool);
        if (i < updates.length - 1) query += "\n";
    }
    h.query(query, pool, callback);
};

exports.updateSchools = function(updates, callback) {
    var proc_name_n = "UpdateSchoolName";
    var proc_name_s = "UpdateSchoolSASName";
    var query = "";
    var ids = Object.keys(updates);
    var h = helper;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var st = updates[id];
        var params_n = [id, st.name];
        var params_s = [id, st.sas_name];
        if (st.name) query += h.buildProcQuery(proc_name_n, params_n, pool);
        if (st.sas_name) query += h.buildProcQuery(proc_name_s, params_s, pool);
        if (i < updates.length - 1) query += "\n";
    }
    h.query(query, pool, callback);
};

exports.updateClassTeacher = function(class_id, teacher_id, callback) {
    var proc_name = "UpdateClassTeacher";
    var params = [class_id, teacher_id];
    helper.runProc(proc_name, params, pool, callback);
};

exports.removeStudents = function(removed, callback) {
    var proc_name = "RemoveStudent";
    var query = "";
    for (var r = 0; r < removed.length; r++) {
        var id = removed[r];
        var params = [id];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < removed.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.removeTeachers = function(removed, callback) {
    var proc_name = "RemoveTeacher";
    var query = "";
    for (var r = 0; r < removed.length; r++) {
        var id = removed[r];
        var params = [id];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < removed.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.removeClasses = function(removed, callback) {
    var proc_name = "RemoveClass";
    var query = "";
    for (var r = 0; r < removed.length; r++) {
        var id = removed[r];
        var params = [id];
        console.log("ID: " + JSON.stringify(id));
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < removed.length - 1) query += "\n";
    }
    console.log("Remove Query: " + query);
    helper.query(query, pool, callback);
};

exports.removeSchools = function(removed, callback) {
    var proc_name = "RemoveSchool";
    var query = "";
    for (var r = 0; r < removed.length; r++) {
        var id = removed[r];
        var params = [id];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < removed.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};

exports.removeStudentsFromClass = function(class_id, removed, callback) {
    var proc_name = "RemoveStudentFromClass";
    var query = "";
    for (var r = 0; r < removed.length; r++) {
        var id = removed[r];
        var params = [class_id, id];
        query += helper.buildProcQuery(proc_name, params, pool);
        if (r < removed.length - 1) query += "\n";
    }
    helper.query(query, pool, callback);
};
