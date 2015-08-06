module.exports = function(pool);

function logQuery(query) {
    console.log();
    console.log("==========QUERY==========");
    console.log(query);
    console.log("========END QUERY========");
    console.log();
}

exports.findAllUsersOfType = function(type, callback) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email", "sas_classes.room_num"],
        table: "users"
    };
    var addition = "JOIN user_info ON users.id = user_info.user_id "
                    + "JOIN sas_classes ON user_info.sas_class_id = sas_classes.id "
                    + "WHERE type=" + mysql.escape(type);

    find(query_object, addition, callback);
};

exports.find = function(query_object, addition, callback) {
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

    pool.getConnection(function(error, connection) {
        connection.query(select_query, function(error, rows, fields) {
            if (error) {
                console.log(error);
                log(select_query, "query");
            } else {
                callback(rows);
            }
        });
    });
}

exports.update = function(query_object, callback) {
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

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            var messages = [];
            if (error) {
                console.log(error.code);
                log(query, "query");
            }
            callback(messages);
            connection.release();
        });
    });
}

exports.add = function(query_object, callback) {
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

    pool.getConnection(function(error, connection) {
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error);
                log(query, "query");
            }
            callback(messages);
            connection.release();
        });
    });
}

exports.remove = function(query_object, callback) {
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

    pool.getConnection(function(error, connection) {
        helper.processError(error);
        connection.query(query, function(error, rows, fields) {
            helper.processQueryError(error, query);
            callback(messages);
            connection.release();
        });
    });
}

exports.processQueryError = function(error, query) {
    if (error) {
        log(error, "error");
        log(query, "query");
    }
}

exports.processError = function(error) {
    if (error) {
        log(error, "error");
        process.exit();
    }
}

exports.log = function(query, type) {
    type = type.toUpperCase();
    console.log();
    console.log("===============" + type + "===============");
    console.log(query);
    console.log("=============END " + type + "=============");
    console.log();
}
