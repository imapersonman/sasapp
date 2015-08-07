var mysql = require("mysql");
var config = require("../config/database");
config.connectionLimit = 20;
var pool = mysql.createPool(config);
var helper = require("./model_helpers");

// Currently not being used. 
exports.findUserForGoogle = function(google_id, callback) {
    var esc_google_id = mysql.escape(google_id);
    var query = "SELECT users.name AS name, "
		+ "users.email AS email, "
		+ "users.google_id AS google_id, "
		+ "users.token AS token, "
		+ "user_info.type AS type, "
		+ "schools.name AS school_name, "
		+ "schools.sas_name AS sas_name "
        + "FROM users "
		+ "JOIN user_info ON user_info.user_id = users.id "
		+ "JOIN schools ON user_info.school_id = schools.id "
        + "WHERE google_id=" + esc_google_id;
		+ "LIMIT 1";

    pool.getConnection(function(error, connection) {
        if (error) callback(error, null);
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error.code);
                logQuery(query);
                callback(error, null);
                return;
            }
            if (rows.length != 1) {
                callback(null, null);
                return;
            }
            callback(null, rows[0]);
            connection.release();
        });
    });
};

/* 
 * findUserByEmail(email, callback)
 * 	Given an email and a callback function, 'findUserByEmail' queries the
 * 	database for a user with a matching email.  This is possible because the
 * 	mysql database uses the email as a unique key.  If a user is found, a user
 * 	is passed to the callback's second argument.  If there is an error during
 * 	the query, mysql's error object is passed into the callback's first
 * 	argument.
 */
exports.findUserByEmail = function(email, callback) {
    var esc_email = mysql.escape(email);
    var query = "SELECT users.name AS name, "
		+ "users.email AS email, "
		+ "users.google_id AS google_id, "
		+ "users.token AS token "
        + "FROM users "
        + "WHERE email = " + esc_email + " "
		+ "LIMIT 1";

    pool.getConnection(function(error, connection) {
        if (error) callback(error, null);
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error);
                helper.logQuery(query);
                callback(error, null);
                return;
            }
	    // I don't know if mysql's 'LIMIT 1' returns an array or a single
	    // object.  I might have to come back to this later.
            callback(null, rows[0]);
            connection.release();
        });
    });
};

/*
 * findUser(user_id, callback)
 * 	Given an id for the user and a callback function 'findUser' queries the
 * 	database for a user with a matching id.  If found, an object is passed as the
 * 	callback's second argument containing the results of the following fields:
 * 		- users.id
 * 		- users.name
 * 		- users.email
 * 		- users.google_id
 * 		- users.token
 * 		- user_info.type (pointed to by the table users)
 *
 * 	I don't know what this function is called by.
 *
 * 	Callback signature:
 * 		function(error, users)
 *
 * 	In the future, this function should call model_helper's 'find' function.
 * 	Before this is possible 'find' needs to support table JOINs.
 */
exports.findUser = function(user_id, callback) {
    var query = "SELECT DISTINCT "
                + "users.id AS id"
                + "users.name AS name, "
                + "users.email AS email, "
                + "users.google_id AS google_id, "
                + "users.token AS token, "
                + "user_info.type AS type "
                + "FROM users "
                + "JOIN user_info ON users.id = user_info.user_id "
                + "WHERE id=" + mysql.escape(user_id);

    pool.getConnection(function(error, connection) {
	helper.processError(error);
        connection.query(query, function(error, rows, fields) {
            if (error) {
                helper.log(error, "error");
                helper.log(query, "query");
                callback(error, null);
                return;
            }
            callback(null, rows[0]);
            connection.release();
        });
    });
};

/*
 * firstLogin(google_id, token, email, callback)
 * 	Given a google_id, token, email, and a callback function, 'firstLogin' adds
 * 	the inputted information to the database for a given email.  If there is an
 * 	error generated by mysql, mysql's error object is passed as the callback's
 * 	first argument.  If there is no error, the resulting user object is passed
 * 	as the callback's second argument, regardless is there is an email found.
 * 	If there is no email found, the user object is without a type, which is
 * 	filtered out by the route object.
 * 	
 * 	Callback signature:
 * 		function(error, user)
 */
exports.firstLogin = function(google_id, token, email, callback) {
    var esc_google_id = mysql.escape(google_id);
    var esc_token = mysql.escape(token);
    var esc_email = mysql.escape(email);
    var query = "UPDATE users"
                + " SET google_id=" + esc_google_id + ","
                + " token=" + esc_token
                + " WHERE email=" + esc_email;

    pool.getConnection(function(error, connection) {
        helper.processError(error);
        connection.query(query, function(error, rows, fields) {
            if (error) {
                helper.log(error, "error");
                helper.log(query, "query");
                callback(error, null);
            }else {
                var user = {};
                user.google_id = google_id;
                user.token = token;
                user.email = email;
            }
            connection.release();
        });
    });
};

/*
 * findAllUsers(callback)
 * 	Given a callback function,'findAllUsers' returns a user object containing
 * 	the user's id, name, email, room_num (which they might not have), and type.
 * 	This function is deprecated.
 *
 * 	Callback signature:
 * 		function(users)
 */
exports.findAllUsers = function(callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email", "sas_classes.room_num", "user_info.type"],
        table: "users"
    };
    var addition = "JOIN user_info ON users.id = user_info.user_id "
                    + "LEFT JOIN sas_classes ON user_info.sas_class_id = sas_classes.id";
    helper.find(query_object, "", callback, pool)
};

/*
 * findStudentsForClass(class_id, callback)
 * 	Given a class_id and a callback function, 'findStudentsForClass' returns
 * 	a list of user objects containing an id, name, and email.  This is all the
 * 	information needed for a class.  This function is currently not in use.
 *
 * 	Callback signature:
 * 		function(students)
 */
exports.findStudentsForClass = function(class_id, callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email"],
        table: "student_classes"
    };
    var addition = "JOIN users ON student_classes.student_id = users.id "
                    + "WHERE student_classes.class_id = "
                    + mysql.escape(class_id);
    helper.find(query_object, addition, callback, pool);
};

/*
 * findStudentsForTeacher(teacher_id, callback)
 * 	Given a teacher_id, 'findStudentsForTeacher' passes a list of students which
 * 	correspond to the teacher_id to the callback function's only argument.  Each
 * 	student has a user id, name, and email address.
 *
 * 	Callback signature:
 * 		function(students)
 */
exports.findStudentsForTeacher = function(teacher_id, callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email"],
        table: "classes"
    };
    var addition = "JOIN student_classes ON student_classes.class_id = classes.id "
                    + "JOIN users ON student_classes.student_id = users.id "
                    + "WHERE classes.teacher_id = " + mysql.escape(teacher_id) + " "
                    + "GROUP BY users.id";

    helper.find(query_object, addition, callback, pool);
};

/*
 * findTeachersForStudent(student_id, callback)
 * 	Given a student_id and a callback function, 'findTeachersForStudent' passes
 * 	a list of teachers that correspond to the student_id as the callback's only
 * 	argument.
 *
 * 	Callback signature:
 * 		function(teachers)
 */
exports.findTeachersForStudent = function(student_id, callback) {
    var query_object = {
        fields: ["users.name", "users.email", "sas_classes.room_num"],
        table: "student_classes"
    };
    var addition = "JOIN classes ON student_classes.class_id = classes.id "
                    + "JOIN users ON classes.teacher_id = users.id "
                    + "JOIN user_info ON users.id = user_info.user_id "
                    + "JOIN sas_classes ON user_info.sas_class_id = sas_classes.id";

    helper.find(query_object, addition, callback, pool);
};

/*
 * findRankingsForStudent(student_id, callback)
 * 	Given a student_id and a callback function, 'findRankingsForStudent' passes
 * 	a list of SAS requests to the callback functions only argument.
 *
 * 	Callback signature:
 * 		function(rankings)
 *
 * 	Each ranking returned by this function has a teacher's name, room_num, and
 * 	rank assigned to it by the student.  Each ranking will go into an algorithm
 * 	that determines where each student will go for SAS.
 */
exports.findRankingsForStudent = function(student_id, callback) {
    var query_object = {
        fields: ["users.name", "sas_classes.room_num", "sas_requests.rank"],
        table: "sas_requests"
    };
    var addition = "JOIN sas_classes ON sas_requests.sas_class_id = sas_classes.id "
                    + "JOIN user_info ON sas_classes.id = user_info.sas_class_id "
                    + "JOIN users ON user_info.user_id = users.id "
                    + "WHERE sas_requests.student_id = " + mysql.escape(student_id);

    helper.find(query_object, addition, callback, pool);
};

/*
 * findRankingsForTeacher
 * 	Given a teacher_id and a callback function, 'findRankingsForTeacher' returns
 * 	a list of students they requested to be in their SAS class.
 *
 * 	Callback signature:
 * 		function(rankings)
 * 		
 * 	This function does not seem to work as intended.  Come back when access to
 * 	the database is available.
 */
exports.findRankingsForTeacher = function(teacher_id, callback) {
    var query_object = {
        fields: ["users.name"],
        table: "sas_requests"
    };
    var addition = "JOIN user_info ON sas_requests.sas_class_id=user_info.sas_class_id "
                    + "JOIN users ON user_info.user_id = users.id AND user_info.type = \"teacher\" "
                    + "WHERE users.id = " + mysql.escape(teacher_id);

    helper.find(query_object, addition, callback, pool);
};

/*
 * findAllStudents(type, callback)
 * 	See model_helper.findAllUsersOfType(type, callback).
 *
 * 	Callback signature:
 * 		function(users)
 */
exports.findAllStudents = function(callback) {
    helper.findAllUsersOfType("student", callback, pool);
};

/*
 * findAllTeachers(type, callback)
 * 	See model_helper.findAllUsersOfType(type, callback).
 *
 * 	Callback signature:
 * 		function(users)
 */
exports.findAllTeachers = function(callback) {
    helper.findAllUsersOfType("teacher", callback, pool)
};

/*
 * findClass(class_id, callback)
 * 	Given a class_id, 'findClass' passes a class object containing the following
 * 	fields:
 * 		- id
 * 		- name
 * 		- room_num
 *		- period
 *		- teacher_id
 *		- teacher_name, 
 *		- email
 *		
 *	If there is no teacher present, the teacher_id and teacher_name fields are
 *	empty.
 */
exports.findClass = function(class_id, callback) {
    var query = "SELECT "
                + "classes.id AS id, "
                + "classes.name AS name, "
                + "classes.room_num AS room_num, "
                + "classes.period AS period, "
                + "users.id AS teacher_id, "
                + "users.name AS teacher_name, "
                + "users.email AS email "
                + "FROM classes "
                + "LEFT JOIN users ON classes.teacher_id = users.id "
                + "WHERE classes.id = " + mysql.escape(class_id);

    pool.getConnection(function(error, connection) {
        helper.processError();
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error);
                log(query, "query");
            } else {
                callback(rows[0]);
            }
            connection.release();
        });
    });
};

// This needs to be re-written using 'helper.find()'.
exports.findAllClasses = function(callback) {
    var query = "SELECT "
                + "classes.id AS id, "
                + "classes.name AS name, "
                + "classes.room_num AS room_num, "
                + "classes.period AS period, "
                + "users.name AS teacher_name "
                + "FROM classes "
                + "LEFT JOIN users ON classes.teacher_id = users.id";

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(rows);
            connection.release();
        });
    });
};

exports.addUsers = function(added, callback) {
    query_object = {
        fields: ["name", "email", "type"],
        table: "users",
        added: added
    };
    helper.add(query_object, callback, pool);
};

exports.addClasses = function(added, callback) {
    query_object = {
        fields: ["name", "room_num", "period"],
        table: "classes",
        added: added
    };
    helper.add(query_object, callback, pool);
};

// This needs to be re-written using 'helper.add()'.
exports.addStudentsToClass = function(class_id, added, callback) {
    var query = "INSERT INTO student_classes (`student_id`, `class_id`) VALUES ";
    for (var a = 0; a < added.length; a++) {
        var student_id = added[a];
        query += "(" + mysql.escape(student_id) + ", " + mysql.escape(class_id) + ")"
        if (a < added.length - 1) query += ", ";
    }

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(messages);
            connection.release();
        });
    });
};

// This needs to be re-written using 'helper.add()'.
exports.addTeacherSASRequests = function(students, callback) {
    var query = "INSERT INTO `sas_requests` (`student_id`, `timestamp`, `rank`) VALUES ";
    for (var s = 0; s < students.length; s++) {
        var id = mysql.escape(students[s].id);
        query += "(" + id + ", NOW(), -1)";
        if (s < students.length - 1) {
            query += ",";
        }
    }

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(messages);
            connection.release();
        });
    });
};

// This needs to be re-written using 'helper.add()'.
exports.addSASRequests = function(ranks, callback) {
    var query = "INSERT INTO `sas_requests` (`student_id`, `timestamp`, `rank`) VALUES ";
    for (var r = 0; r < ranks.length; r++) {
        var id = mysql.escape(ranks[r].id);
        var rank = mysql.escape(ranks[r].rank);
        query += "(" + id + ", NOW(), " + rank + ")";
        if (r < ranks.length - 1) {
            query += ",";
        }
    }

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(messages);
            connection.release();
        });
    });
};

exports.updateUsers = function(updates, callback) {
    var query_object = {
        fields: ["name", "email"],
        table: "users",
        updates: updates
    };
    helper.update(query_object, callback, pool);
};

exports.updateClasses = function(updates, callback) {
    var query_object = {
        fields: ["name", "room_num", "period"],
        table: "classes",
        updates: updates
    };
    helper.update(query_object, callback, pool);
};

// This needs to be re-written using 'helper.update()'.
exports.updateClassTeacher = function(class_id, teacher_id, callback) {
    var query = "UPDATE classes "
                + "SET teacher_id = " + mysql.escape(teacher_id) + " "
                + "WHERE classes.id = " + class_id;

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(messages);
            connection.release();
        });
    });
};

// This needs to be re-written using 'helper.remove()'.
exports.removeStudentsFromClass = function(class_id, removed, callback) {
    var query = "DELETE FROM student_classes WHERE "
    var half_query = "(class_id = " + mysql.escape(class_id) + " AND student_id = ";
    for (var r = 0; r < removed.length; r++) {
        var student_id = removed[r];
        if (r > 0) query += " OR "
        query += half_query + mysql.escape(student_id) + ")";
    }

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error);
                logQuery(query);
            }
            callback(messages);
            connection.release();
        });
    });
};

exports.removeClasses = function(removed, callback) {
    var query_object = {
        removed: removed,
        table: "classes"
    };
    helper.remove(query_object, callback, pool);
};
