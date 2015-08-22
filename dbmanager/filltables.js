var mysql = require("mysql");
var config = require("../config/database");
config.multipleStatements = true;
var pool = mysql.createPool(config);
var h = require("../app/model_helpers");

const NSTUDENTS = 2400;
const NTEACHERS = 100;
const CLASSES_PER_STUDENT = 6;
const CLASSES_PER_TEACHER = 6;
const NAME_LENGTH = 8;
const CLASS_NAME_LENGTH = 16;
const NPERIODS = 6;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const T_EMAIL_EXT = "@shorelineschools.org";
const S_EMAIL_EXT = "@k12.shorelineschools.org";

fillTeachers();

function fillTeachers() {
    var t_proc_name = "AddTeacher";
    var t_query = "";
    for (var t = 0; t < NTEACHERS; t++) {
        var t_name = generateRandomString(NAME_LENGTH);
        var t_email = t_name + "." + t_name + T_EMAIL_EXT;
        var t_room_num = "M" + t;
        var t_params = [t_name, t_email, t_room_num];
        t_query += h.buildProcQuery(t_proc_name, t_params, pool);
    }
    h.query(t_query, pool, function(error, results) {
        fillClasses()
    });
}

function fillClasses() {
    var c_proc_name = "AddClass";
    var c_query = "";
    h.query(t_query, pool, function(error, results) {
        for (var r = 0; r < NTEACHERS; r++) {
            var id = results[r].id;
            for (var c = 0; c < CLASSES_PER_TEACHER; c++) {
                var c_name = generateRandomString(CLASS_NAME_LENGTH);
                var c_room_num = id + "" + c;
                var c_period = randomInt(0, 6);
                var c_params = [c_name, c_room_num, c_period];
                c_query += h.buildProcQuery(c_proc_name, c_params, pool);
            }
        }
        h.query(c_query, pool, function(error, results) {

            fillStudents();
        });
    });
}

function fillStudents() {
    var s_proc_name = "AddStudent";
    var s_query = "";
    for (var s = 0; s < NSTUDENTS; s++) {
        var s_name = generateRandomString(NAME_LENGTH);
        var s_email = s_name + "." + s_name + S_EMAIL_EXT;
        var s_params = [s_name, s_email];
        s_query += h.buildProcQuery(s_proc_name, s_params, pool);
    }
    h.query(s_query, pool, function(error, results) {
        assignUsersToClass();
    });
}

function assignUsersToClass() {
    var u_query = "SELECT id, type FROM users WHERE type != \"admin\"";
    var s_proc_name = "AddStudentToClass";
    var t_proc_name = "UpdateClassTeacher";
    var c_query = "SELECT id FROM classes";
    var query = "";
    h.query(u_query, pool, function(error, u_results) {
        var user = u_results[u];
        h.query(c_query, pool, function(error, c_results) {
            for (var u = 0; u < u_results.length; u++) {
                var class_index = -1;
                var proc_name = "";
                if (user.type == "student") {
                    var chosen_classes = [];
                    for (var c = 0; c < CLASSES_PER_STUDENT; c++) {
                        while (chosen_classes.indexOf(class_index) != -1) {
                            class_index = randomInt(0, c_results.length);
                        }
                        chosen_classes.push(class_index);
                        proc_name = s_proc_name;
                    }
                } else if (user.type == "teacher") {
                    class_index = Math.floor(NTEACHERS / CLASSES_PER_TEACHER);
                    proc_name = t_proc_name;
                }
                var class_id = c_results[class_index].id;
                var params = [class_id, user.id];
                query += h.buildProcQuery(proc_name, params, pool);
                if (u < u_results.length - 1) query += "\n";
            }
            h.query(query, pool, function(error, results) {
                console.log("Successfully filled database");
            });
        });
    });
}

function generateRandomString(length) {
    const str = "";
    for (var l = 0; l < length; l++) {
        str += LETTERS[randomInt(0, LETTERS.length)];
    }
    return str;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (min - max + 1)) + min);
}
