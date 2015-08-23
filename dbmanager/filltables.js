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

exports.run = function() {
    fillTeachers();
};

exports.run();

function fillTeachers() {
    console.log("FillTeachers");
    var t_proc_name = "AddTeacher";
    var t_query = "";
    for (var t = 0; t < NTEACHERS; t++) {
        var t_name = generateRandomString(NAME_LENGTH);
        var t_email = t_name + "." + t_name + T_EMAIL_EXT;
        var t_room_num = "M" + t;
        var t_params = [t_name, t_email, t_room_num];
        t_query += h.buildProcQuery(t_proc_name, t_params);
    }
    h.query(t_query, function(error, results) {
        fillClasses()
    });
}

function fillClasses() {
    console.log("FillClasses");
    var c_proc_name = "AddClass";
    var c_query = "";
    var proc_name = "FindAllTeachers";
    h.runProc(proc_name, [], function(error, results) {
        for (var r = 0; r < NTEACHERS; r++) {
            var id = results[r].id;
            for (var c = 0; c < CLASSES_PER_TEACHER; c++) {
                var c_name = generateRandomString(CLASS_NAME_LENGTH);
                var c_room_num = id + "" + c;
                var c_period = randomInt(0, 6);
                var c_params = [c_name, c_room_num, c_period];
                c_query += h.buildProcQuery(c_proc_name, c_params);
            }
        }
        h.query(c_query, function(error, results) {
            fillStudents();
        });
    });
}

function fillStudents() {
    console.log("FillStudents");
    var s_proc_name = "AddStudent";
    var s_query = "";
    for (var s = 0; s < NSTUDENTS; s++) {
        var s_name = generateRandomString(NAME_LENGTH);
        var s_email = s_name + "." + s_name + S_EMAIL_EXT;
        var s_params = [s_name, s_email];
        s_query += h.buildProcQuery(s_proc_name, s_params);
    }
    h.query(s_query, function(error, results) {
        assignUsersToClass();
    });
}

function assignUsersToClass() {
    console.log("AssignUsersToClass");
    var s_proc_name = "AddStudentToClass";
    var t_proc_name = "UpdateClassTeacher";
    var c_proc_name = "FindAllClasses";
    var f_proc_name = "FindAllUsers";
    var u_query = h.buildProcQuery(f_proc_name, []);
    var c_query = h.buildProcQuery(c_proc_name, []);
    var query = "";
    h.query(u_query, function(error, u_results) {
        h.query(c_query, function(error, c_results) {
            for (var u = 0; u < u_results.length; u++) {
                var user = u_results[u];
                
                if (user.type == "student") {
                    var chosen_classes = [];
                    for (var c = 0; c < CLASSES_PER_STUDENT; c++) {
                        var class_index = randomInt(0, c_results.length - 1);
                        while (chosen_classes.indexOf(class_index) > -1) {
                            class_index = randomInt(0, c_results.length - 1);
                        }
                        var class_id = c_results[class_index].id;
                        var params = [class_id, user.id];
                        query += h.buildProcQuery(s_proc_name, params);
                        if (c < CLASSES_PER_TEACHER - 1) query += "\n";
                    }
                } else if (user.type == "teacher") {
                    var chosen_classes = [];
                    for (var c = 0; c < CLASSES_PER_TEACHER; c++) {
                        var class_index = randomInt(0, c_results.length - 1);
                        while (chosen_classes.indexOf(class_index) > -1
                                && c_results[class_index].teacher == null) {
                            class_index = randomInt(0, c_results.length - 1);
                        }
                        var class_id = c_results[class_index].id;
                        var params = [class_id, user.id];
                        query += h.buildProcQuery(t_proc_name, params);
                        if (c < CLASSES_PER_TEACHER - 1) query += "\n";
                    }
                } else {
                    continue;
                }

                if (u < u_results.length - 1) query += "\n";
            }
            h.query(query, function(error, results) {
                console.log("Successfully filled database.");
                process.exit();
            });
        });
    });
}

function generateRandomString(length) {
    var str = "";
    for (var l = 0; l < length; l++) {
        var rChar = LETTERS.charAt(randomInt(0, LETTERS.length - 1));
        str += rChar;
    }
    return str;
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
