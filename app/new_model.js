var mysql = require("mysql");
var config = require("../config/database");
var connection = mysql.createConnection(config);

connection.connect();

exports.findUserForGoogle = function(google_id, callback) {
    var esc_google_id = mysql.escape(google_id);
    var query = "SELECT DISTINCT * "
                + "FROM users "
                + "WHERE google_id=" + esc_google_id;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            logQuery(query);
            callback(error, null);
            return
        }
        if (rows.length != 1) {
            callback(null, null);
            return;
        }
        callback(null, rows[0]);
    });
};

exports.findUserByEmail = function(email, callback) {
    var esc_email = mysql.escape(email);
    var query = "SELECT DISTINCT * "
                + "FROM users "
                + "WHERE email=" + esc_email;
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
    });
};

exports.findUser = function(user_id, callback) {
    var esc_user_id = mysql.escape(user_id);
    var query = "SELECT DISTINCT "
                + "users.id AS id"
                + "users.name AS name, "
                + "users.email AS email, "
                + "users.type AS type, "
                + "users.google_id AS google_id, "
                + "users.token AS token "
                + "FROM users "
                + "WHERE id=" + esc_user_id;
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
    });
};

exports.firstLogin = function(google_id, token, email, callback) {
    var esc_google_id = mysql.escape(google_id);
    var esc_token = mysql.escape(token);
    var esc_email = mysql.escape(email);
    var query = "UPDATE users"
                + " SET google_id=" + esc_google_id + ","
                + " token=" + esc_token
                + " WHERE email=" + esc_email;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            logQuery(query);
            callback(error, null);
        }else {
            var user = {};
            user.google_id = google_id;
            user.token = token;
            user.email = email;
            callback(null, user);
        }
    });
};

exports.findAllUsers = function(callback) {
    var query_object = {
        fields: ["id", "name", "email", "room_num", "type"],
        table: "users"
    };
    find(query_object, "", callback)
};

exports.findStudentsForClass = function(class_id, callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email"],
        table: "student_classes"
    };
    var addition = "JOIN users ON student_classes.student_id = users.id "
                    + "WHERE student_classes.class_id = "
                    + mysql.escape(class_id);
    find(query_object, addition, callback);
};

exports.findStudentsForTeacher = function(teacher_id, callback) {
    var query = "SELECT "
                + "users.id AS id, "
                + "users.name AS name, "
                + "users.email AS email, "
                + "student_classes.id AS st_id "
                + "FROM classes "
                + "JOIN student_classes ON student_classes.class_id = classes.id "
                + "JOIN users ON student_classes.student_id = users.id "
                + "WHERE classes.teacher_id = " + mysql.escape(teacher_id) + " "
                + "GROUP BY users.id";

    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(error);
        } else {
            callback(rows);
        }
    });
};

exports.findTeachersForStudent = function(student_id, callback) {
    var query = "SELECT "
                + "users.name AS name, "
                + "users.email AS email, "
                + "users.room_num AS room_num "
                + "FROM student_classes "
                + "JOIN classes ON student_classes.class_id = classes.id "
                + "JOIN users ON classes.teacher_id = users.id "
                + "WHERE student_classes.student_id = " + mysql.escape(student_id) + " "
                + "GROUP BY users.id";

    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(rows);
    });
};

exports.findRankingsForStudent = function(student_id, callback) {
    var query = "SELECT "
                + "users.name AS name, "
                + "users.room_num AS room_num, "
                + "sas_requests.rank AS rank "
                + "FROM sas_requests "
                + "JOIN student_classes ON sas_requests.user_class_id = student_classes.id "
                + "JOIN classes ON student_classes.class_id = classes.id "
                + "JOIN users ON classes.teacher_id = users.id "
                + "WHERE student_classes.student_id = " + mysql.escape(student_id) + " "
                + "AND sas_requests.rank != -1";

    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(rows);
    });
};

exports.findStudentsForRoom = function(room_num, callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email"],
        table: "users"
    };
    var addition = "WHERE `room_num` = " + mysql.escape(room_num);
    find(query_object, addition, callback);
};

exports.findAllStudents = function(callback) {
    var query_object = {
        fields: ["id", "name", "email", "room_num"],
        table: "users"
    };
    var addition = "WHERE type=\"student\"";
    find(query_object, addition, callback);
};

exports.findAllTeachers = function(callback) {
    var query_object = {
        fields: ["id", "name", "email", "room_num"],
        table: "users"
    };
    var addition = "WHERE type = \"teacher\"";
    find(query_object, addition, callback);
};

// NOT COPIED
exports.updateUsers = function(updates, callback) {
    var query_object = {
        fields: ["name", "email", "room_num"],
        table: "users",
        updates: updates
    };
    update(query_object, callback);
};

exports.addUsers = function(added, callback) {
    query_object = {
        fields: ["name", "email", "room_num", "type"],
        table: "users",
        added: added
    };
    add(query_object, callback);
};

exports.addStudentsToClass = function(class_id, added, callback) {
    var query = "INSERT INTO student_classes (`student_id`, `class_id`) VALUES ";
    for (var a = 0; a < added.length; a++) {
        var student_id = added[a];
        query += "(" + mysql.escape(student_id) + ", " + mysql.escape(class_id) + ")"
        if (a < added.length - 1) query += ", ";
    }

    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
};

exports.removeStudentsFromClass = function(class_id, removed, callback) {
    var query = "DELETE FROM student_classes WHERE "
    var half_query = "(class_id = " + mysql.escape(class_id) + " AND student_id = ";
    for (var r = 0; r < removed.length; r++) {
        var student_id = removed[r];
        if (r > 0) query += " OR "
        query += half_query + mysql.escape(student_id) + ")";
    }
    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
    console.log(query);
};

exports.removeUsers = function(removed, callback) {
    var query_object = {
        removed: removed,
        table: "users"
    };
    remove(query_object, callback)
};

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

    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(query);
        } else {
            callback(rows[0]);
        }
    });
};

exports.findAllClasses = function(callback) {
    var query = "SELECT "
                + "classes.id AS id, "
                + "classes.name AS name, "
                + "classes.room_num AS room_num, "
                + "classes.period AS period, "
                + "users.name AS teacher_name "
                + "FROM classes "
                + "LEFT JOIN users ON classes.teacher_id = users.id";

    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(rows);
    });
};

exports.updateClasses = function(updates, callback) {
    var query_object = {
        fields: ["name", "room_num", "period"],
        table: "classes",
        updates: updates
    };
    update(query_object, callback);
};

exports.updateClassTeacher = function(class_id, teacher_id, callback) {
    var query = "UPDATE classes "
                + "SET teacher_id = " + mysql.escape(teacher_id) + " "
                + "WHERE classes.id = " + class_id;

    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
};

exports.addClasses = function(added, callback) {
    query_object = {
        fields: ["name", "room_num", "period"],
        table: "classes",
        added: added
    };
    add(query_object, callback)
};

exports.removeClasses = function(removed, callback) {
    var query_object = {
        removed: removed,
        table: "classes"
    };
    remove(query_object, callback);
};

exports.addTeacherSASRequests = function(students, callback) {
    var query = "INSERT INTO `sas_requests` (`user_class_id`, `timestamp`, `rank`) VALUES ";
    for (var s = 0; s < students.length; s++) {
        var st_id = mysql.escape(students[s].st_id);
        query += "(" + st_id + ", NOW(), -1)";
        if (s < students.length - 1) {
            query += ",";
        }
    }

    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
};

exports.addSASRequests = function(ranks, callback) {
    var query = "INSERT INTO `sas_requests` (`user_class_id`, `timestamp`, `rank`) VALUES ";
    for (var r = 0; r < ranks.length; r++) {
        var st_id = mysql.escape(ranks[r].st_id);
        var rank = mysql.escape(ranks[r].rank);
        query += "(" + st_id + ", NOW(), " + rank + ")";
        if (r < ranks.length - 1) {
            query += ",";
        }
    }
    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
};

/********************
 * Helper Functions *
 ********************/
function logQuery(query) {
    console.log();
    console.log("==========QUERY==========");
    console.log(query);
    console.log("========END QUERY========");
    console.log();
}

function find(query_object, addition, callback) {
    var select_query = "SELECT ";
    var field_array = query_object.fields;
    if (field_array[0] == "*") {
        select_query += "* ";
    } else {
        for (var f = 0; f < field_array.length; f++) {
            var field = field_array[f];
            select_query += mysql.escapeId(field);
            if (f < field_array.length - 1) select_query += ",";
            select_query += " ";
        }
    }
    select_query += "FROM " + mysql.escapeId(query_object.table);
    select_query += " " + addition;
    connection.query(select_query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(select_query);
        } else {
            callback(rows);
        }
    });
}

function update(query_object, callback) {
    var query = "UPDATE " + query_object.table + " SET ";
    var columns = query_object.fields;
    var updates = query_object.updates;
    var u_keys = Object.keys(updates);
    var ids = [];
    for (var c = 0; c < columns.length; c++) {
        var key = columns[c];
        var c_query;
        var c_queries = [];
        for (var u = 0; u < u_keys.length; u++) {
            c_query = "";
            var id = u_keys[u];
            var object = updates[id];
            if (object[key] != null) {
                c_query += "WHEN id = " + mysql.escape(id) + " THEN " + mysql.escape(object[key]) + " ";
                c_queries.push(c_query);
                if (ids.indexOf(id) == -1) ids.push(id);
            }
        }
        if (c_queries.length > 0) {
            query += mysql.escapeId(key) + " = CASE ";
            for (var cq = 0; cq < c_queries.length; cq++) {
                query += c_queries[cq];
            }
            query += "ELSE " + mysql.escapeId(key) + " END, ";
        }
    }
    query = query.substring(0, query.length - 2);
    query += " ";
    query += "WHERE id IN (";
    for (var i = 0; i < ids.length; i++) {
        query += mysql.escape(ids[i]);
        if (i < ids.length - 1) query += ",";
    }
    query += ")";

    connection.query(query, function(error, rows, fields) {
        var messages = [];
        if (error) {
            console.log(error.code);
            logQuery(query);
        }
        callback(messages);
    });
}

function add(query_object, callback) {
    var messages = [];
    var fields = query_object.fields;
    var field_query = "(";
    var value_query = "(";
    for (var f = 0; f < fields.length; f++) {
        field_query += fields[f];
        value_query += "?";
        if (f < fields.length - 1) {
            field_query += ",";
            value_query += ",";
        }
    }
    field_query += ")";
    value_query += ")";
    var query = "INSERT INTO " + mysql.escapeId(query_object.table) + " " + field_query + " VALUES ";
    var query_values = [];
    var added = query_object.added;
    for(var a = 0; a < added.length; a++) {
        var row = added[a];
        query += value_query;
        if (a < added.length - 1) {
            query += ",";
        }
        for (var f = 0; f < fields.length; f++) {
            query_values.push(row[fields[f]]);
        }
    }
    query = mysql.format(query, query_values);
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            logQuery(query);
        }
        callback(messages);
    });
}

function remove(query_object, callback) {
    var messages = [];
    var query = "DELETE "
                + "FROM " + query_object.table + " "
                + "WHERE id=";
    var query_values = [];
    var removed = query_object.removed;
    for(var r = 0; r < removed.length; r++) {
        query += "?";
        if (r < removed.length - 1) {
            query += " OR id="
        }
    }
    query = mysql.format(query, removed);
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            logQuery(query);
        }
        callback(messages);
    });
}
