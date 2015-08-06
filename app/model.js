var mysql = require("mysql");
var config = require("../config/database");
var connection = mysql.createConnection(config);

connection.connect();

function User() {
    this.user_id = null;
    this.name = null;
    this.email = null;
    this.type = null;
    this.id = null;
    this.token = null;
}

function Student(user) {
    this.user_id = user.user_id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.id = user.id;
    this.token = user.token;
    
    this.sas_teacher_id = null;
    this.teachers = [];
}

function MinStudent() {
    this.user_id = null;
    this.name = null;
    this.email = null;
}

function Teacher(user) {
    this.user_id = user.user_id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.id = user.id;
    this.token = user.token;
    
    this.sas_room_num = null;
    this.students = [];
}

function MinTeacher() {
    this.name = null;
    this.email = null;
    this.class_name = null;
    this.sas_room_num;
}

function Class() {
    this.id = null;
    this.name = null;
    this.teacher_name = null;
    this.period = null;
    this.room_num = null;
    this.students = [];
}

exports.findUser = function(id, callback) {
    var esc_id = mysql.escape(id);
    var uQuery = "SELECT * FROM users WHERE id="
                + esc_id;
    connection.query(uQuery, function(error, uRows, fields) {
        if (error) {
            console.log("We are in n such");
            callback(error, null);
            return;
        }
        if (uRows.length != 1) {
            error = "Multiple users with the same id: " + uRows.length;
            callback(error, null);
            return;
        }
        
        var user = uRows[0];
        if (user.type == "student") {
            findStudent(user, function(error, student) {
                if (error) {
                    callback(error, null);
                    return;
                }else {
                    callback(null, student);
                }
            });
        }else if (user.type == "teacher") {
            findTeacher(user, function(error, teacher) {
                if (error) {
                    console.log(error.code);
                    callback(error, null);
                    return;
                }else {
                    callback(null, teacher);
                }
            });
        }else if (user.type == "admin") {
            callback(null, user);
        }else {
            error = "The user's type is not recognized: " + user.type;
            callback(error, null);
        }
    });
};

exports.findUserByEmail = function(email, callback) {
    var esc_email = mysql.escape(email);
    var uQuery = "SELECT * FROM users WHERE email=" + esc_email;
    connection.query(uQuery, function(error, uRows, fields) {
        if (error) {
            console.log("We are in n such");
            callback(error, null);
            return;
        }
        if (uRows.length != 1) {
            error = "Multiple users with the same id: " + uRows.length;
            callback(error, null);
            return;
        }
        
        var user = uRows[0];
        if (user.type == "student") {
            findStudent(user, function(error, student) {
                if (error) {
                    callback(error, null);
                    return;
                }else {
                    callback(null, student);
                }
            });
        }else if (user.type == "teacher") {
            findTeacher(user, function(error, teacher) {
                if (error) {
                    console.log(error.code);
                    callback(error, null);
                    return;
                }else {
                    callback(null, teacher);
                }
            });
        }else if (user.type == "admin") {
            callback(null, user);
        }else {
            error = "The user's type is not recognized: " + user.type;
            callback(error, null);
        }
    });
};

exports.firstLogin = function(id, token, email, callback) {
    var escID = mysql.escape(id);
    var escToken = mysql.escape(token);
    var escEmail = mysql.escape(email);
    var query = "UPDATE " + config.tables.users
                + " SET id=" + escID + ","
                + " token=" + escToken
                + " WHERE email=" + escEmail;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            callback(error);
        }else {
            var user = new User();
            user.id = id;
            user.token = token;
            callback(null, user);
        }
    });
}

exports.findAllUsers = function(callback) {
    var query = "SELECT * FROM users";
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            callback(error, null);
        }else {
            callback(null, rows);
        }
    });
};

exports.findAllClasses = function(callback) {
    var query = "SELECT DISTINCT classes.name AS name, classes.class_id AS id, classes.room_num "
                + "AS room_num, classes.period AS period, users.name AS teacher_name "
                + "FROM student_classes "
                + "JOIN classes "
                + "JOIN users "
                + "ON student_classes.class_id=classes.class_id "
                + "AND student_classes.teacher_id=users.user_id";
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            if (error.code == "ER_PARSE_ERROR") {
                console.log();
                console.log("==========QUERY==========");
                console.log(query);
                console.log("========END QEURY========");
                console.log();
            }
            callback(error, null);
        }else {
            callback(null, rows);
        }
    });
};

exports.findAllSASClasses = function(callback) {
    var query = "SELECT name "
                + "FROM users "
                + "WHERE type='teacher'";
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            logQuery(query);
            callback(error, null);
        }else {
            callback(null, rows);
        }
    });
};

exports.findClass = function(id, callback) {
    var esc_id = mysql.escape(id);
    var tQuery = "SELECT classes.class_id AS class_id, "
                + "classes.name AS name, "
                + "classes.period AS period, "
                + "classes.room_num AS room_num, "
                + "users.user_id AS user_id, "
                + "users.name AS teacher_name "
                + "FROM student_classes "
                + "JOIN classes "
                + "JOIN users "
                + "ON student_classes.class_id=classes.class_id "
                + "AND student_classes.teacher_id=users.user_id";
    var sQuery = "SELECT users.user_id AS id, "
                + "users.user_id AS user_id, "
                + "users.name AS name, " 
                + "users.email AS email "
                + "FROM student_classes "
                + "JOIN users "
                + "ON student_classes.student_id=users.user_id";
    var ret_class = new Class();
    connection.query(tQuery, function(tError, tRows, tFields) {
        if (tError) {
            console.log(tError.code);
            logQuery(tQuery);
            callback(tError, null);
            return;
        }
        var tRow = tRows[0];
        connection.query(sQuery, function(sError, sRows, sFields) {
            if (sError) {
                console.log(sError.code);
                logQuery(sQuery);
                callback(sError, null);
                return;
            }
            ret_class.id = tRow.class_id;
            ret_class.name = tRow.name;
            ret_class.teacher_name = tRow.teacher_name;
            ret_class.period = tRow.period;
            ret_class.room_num = tRow.room_num;
            ret_class.students = sRows;
            callback(null, ret_class);
        });
    });
};

exports.findAllStudents = function(callback) {
    var query = "SELECT users.user_id AS user_id, "         // SUBQUERY
                + "users.name AS name, users.email AS email, teachers.sas_room_num AS sas_room_num "
                + "FROM users "
                + "JOIN students "
                + "JOIN teachers "
                + "ON users.user_id=students.student_id "
                + "AND students.sas_teacher_id=teachers.teacher_id";
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            logQuery(query);
            callback(error, null);
        }else {
            callback(null, rows);
        }
    });
};

exports.findAllTeachers = function(callback) {
    var query = "SELECT users.user_id AS user_id, "
                + "users.name AS name, users.email AS email, teachers.sas_room_num AS room_num "
                + "FROM users "
                + "JOIN teachers "
                + "ON users.user_id=teachers.teacher_id ";
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            callback(error, null);
        }else {
            callback(null, rows);
        }
    });
};

exports.updateStudents = function(updates, callback) {
    var query = "UPDATE users, students "
    var qUsers = "WHERE user_id IN(";
    var idList = [];
    var q = 0;
    var property_keys = ["name", "email", "sas_teacher_id"];
    for(var k = 0; k < property_keys.length; k++) {
        var key = property_keys[k];
        query += "SET " + key + "=" + "CASE user_id ";
        for(user_id in updates) {
            var curr_student = updates[user_id];
            if(Object.keys(curr_student).length < 1) continue;
            var value = curr_student[key];
            query += "WHEN " + mysql.escape(user_id) + " THEN ";
            if (value != null) {
                query += mysql.escape(value) + " ";
            }
            query += "ELSE " + key + " ";
            query += "END "
            qUsers += user_id;
            qUsers += (q < Object.keys(curr_student).length - 1) ? "," : ")";
            if(idList.indexOf(user_id) == -1) {
                idList.push(user_id);
            }
            q++;
        }
    }
    query += qUsers;
    logQuery(query);
}

function findStudent(user, callback) {
    var esc_id = mysql.escape(user.user_id);
    var query = "SELECT * FROM students WHERE user_id=" + esc_id;
    var student = new Student(user);
    connection.query(query, function(error, rows, fields) {
        fillTeachers(student, function(error, student) {
            if (error) {
                console.log(error.code);
                callback(error, null);
            }else {
                student.sas_teacher_id = rows[0].sas_teacher_id;
                callback(null, student);
            }
        });
    });
}

function findTeacher(user, callback) {
    var esc_id = mysql.escape(user.user_id);
    var query = "SELECT * FROM teachers WHERE user_id=" + esc_id;
    var teacher = new Teacher(user);
    connection.query(query, function(error, rows, fields) {
        teacher.sas_room_number = rows[0].sas_room_number;
        fillStudents(teacher, function(error) {
            
        });
    });
}

function fillStudents(teacher, callback) {
    var esc_id = mysql.escape(teacher.user_id);
    var query = "";
}

// Grab array of teacher id's.
// loop through id's, grab following information.
// users.name, users.email, classes.class_name, teachers.sas_room_number.
// "SELECT users.name, users.email, classes.class_name, teachers.sas_room_number
// FROM users
// JOIN classes
// JOIN teachers
// ON users.id=classes.teacher_id AND classes.teacher_id=teachers.id
// WHERE users.id=" + teacher.id;
function fillTeachers(student, callback) {
    var esc_id = mysql.escape(student.user_id);
    var query = "SELECT * FROM student_classes WHERE student_id=" + esc_id;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            callback(error, null);
            return;
        }else {
            for(var i = 0; i < rows.length; i++) {
                var query = "SELECT users.name, users.email, classes.name, teachers.sas_room_num "
                            + "FROM users "
                            + "JOIN classes "
                            + "JOIN teachers "
                            + "ON users.user_id=classes.teacher_id AND classes.teacher_id=teachers.teacher_id"
                            + "WHERE users.user_id=" + rows[i].teacher_id;
                collection.query(query, function(error, rows, fields) {
                    console.log("YOJASDIJASDIASJDIASJDI");
                    if (error) {
                        console.log(error.code);
                        callback(error, null);
                        return;
                    }else {
                        var teacher = new MinTeacher();
                        var row = rows[0];
                        teacher.name = row.name;
                        teacher.email = row.email;
                        teacher.class_name = row.class_name;
                        teacher.sas_room_num = row.sas_room_num;
                        student.teachers.push(teacher);
                        callback(null, student);
                    }
                });
            }
        }
    });
}