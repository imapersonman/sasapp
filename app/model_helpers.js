var mysql = require("mysql");
var config = require("../config/database");
config.multipleStatements = true;
config.connectionLimit = 20;
var pool = mysql.createPool(config);

exports.logQuery = function(query) {
    console.log();
    console.log("==========QUERY==========");
    console.log(query);
    console.log("========END QUERY========");
    console.log();
}

exports.findAllUsersOfType = function(type, callback, pool) {
    var query_object = {
        fields: ["users.id", "users.name", "users.email", "sas_classes.room_num"],
        table: "users"
    };
    var addition = "LEFT JOIN sas_classes ON users.sas_class_id = sas_classes.id "
                    + "WHERE type=" + mysql.escape(type);

    exports.find(query_object, addition, callback, pool);
};

exports.findQuery = function(query_object, addition, callback, pool) {
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
    return select_query;
};

exports.updateQuery = function(query_object, callback, pool) {
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
    return query;
};

exports.addQuery = function(query_object) {
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
    return query;
};

exports.removeQuery = function(query_object) {
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
    return query;
};

exports.processQueryError = function(error, query) {
    if (error) {
        exports.log(error, "error");
        exports.log(query, "query");
        process.exit();
    }
}

exports.processError = function(error) {
    if (error) {
        exports.log(error, "error");
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

exports.transact = function(queries, connection, callback) {
    connection.beginTransaction(function(error) {
        exports.processError(error);
        if (queries.length > 0) {
            internalQuery(queries, connection, callback);
        } else {
            console.log("Invalid queries array");
            process.exit();
        }
    });
};

function internalQuery(queries, connection, callback) {
    if (queries.length > 1) {
        connection.query(queries.pop(), function(error, rows, fields) {
            if (error) {
                connection.rollback(function() {
                    exports.log(error, "error");
                });
            } else {
                internalQuery(queries, connection);
            }
        });
    }
    if (queries.length == 1) {
        connection.query(queries[0], function(error, rows, fields) {
            if (error) {
                connection.rollback(function() {
                    exports.log(error, "error");
                });
            } else {
                connection.commit(function(error) {
                    processTransactionError(error, connection);
                    connection.release();
                    callback();
                });
            }
        });
    }
};

exports.processTransactionError = function(error, connection) {
    if (error) {
        connection.rollback(function() {
            exports.log(error, "error");
        });
    }
};

exports.query = function(query, callback) {
    exports.fullQuery(query, function(error, results) {
        callback(error, results[0]);
    });
};

exports.fullQuery = function(query, callback) {
    pool.getConnection(function(error, connection) {
        if (error) throw error;
        connection.query(query, function(error, results) {
            exports.processQueryError(error, query);
            callback(error, results);
        });
    });
};

exports.runProc = function(proc_name, params, callback) {
    var query = exports.buildProcQuery(proc_name, params);
    exports.query(query, callback);
};

exports.buildProcQuery = function(proc_name, params) {
    var query = "CALL " + proc_name + "(";
    for (var p = 0; p < params.length; p++) {
        query += pool.escape(params[p]);
        if (p < params.length - 1) query += ",";
    }
    query += ");";
    return query;
};

exports.buildMultiStatementQuery = function(queries) {
    var query = "";
    for (var q = 0; q < queries.length; q++) {
        query += queries[q];
        if (q < queries.length - 1) query += "; ";
    }
    return query;
};

exports.pool = pool;
