var mysql = require("mysql");
var config = require("../../config/database");
var connection = null;

var User = function() {
    var id = "";
    var user_id = "";
    var token = "";
    var email = "";
    var name = "";
}

module.exports = User;

module.exports.connect = function(callback) {
    connection = mysql.createConnection(config);
    connection.connect(function(error) {
        if (error) {
            console.log("Unable to connect to database.");
            callback(error);
        }else {
            console.log("Successfully connected to database.");
            callback(null);
        }
    });
}

connection = mysql.createConnection(config);
connection.connect(function(error) {
    if (error) {
        console.log("Unable to connect to database.");
    }else {
        console.log("Successfully connected to database.");
    }
});

module.exports.findByID = function(id, callback) {
    if (!connection) {
        var error = { code: "SAS_NOT_CONNECTED" };
        console.log("You either haven't connected to the database or there was an error.");
        callback(error);
    }else {
        var escID = mysql.escape(id);
        var query = "SELECT * FROM " + config.tables.users + " WHERE google_id=" + escID;
        connection.query(query, function(error, rows, fields) {
            if (error || rows.length > 1) {
                console.log(error.code);
                callback(error, null);
            }else if (rows.length > 0) {
                var user = new User();
                user.id = rows[0].google_id;
                user.email = rows[0].email;
                user.name = rows[0].name;
                callback(null, user);
            }else {
                console.log("Nothing found.");
                callback(null, null);
            }
        });
    }
};

module.exports.setIDAndTokenByEmail = function(id, token, email, callback) {
    if (!connection) {
        var error = { code: "SAS_NOT_CONNECTED" };
        console.log("You either haven't connected to the database or there was an error.");
        callback(error);
    }else {
        var escID = mysql.escape(id);
        var escToken = mysql.escape(token);
        var escEmail = mysql.escape(email);
        var query = "UPDATE " + config.tables.users
                    + " SET google_id=" + escID + ","
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
};

/* setTokenByEmail. */

module.exports.createUser = function(email, name, type, callback) {
    if (!connection) {
        var error = { code: "SAS_NOT_CONNECTED" };
        console.log("You either haven't connected to the database or there was an error.");
        callback(error);
    }else {
        var escEmail = mysql.escape(email);
        var escName = mysql.escape(name);
        var escType = mysql.escape(type);
        var query = "INSERT INTO " + config.tables.users + " (email, name, type) VALUES("
                    + escEmail + ","
                    + escName + ","
                    + escType + ")";
        connection.query(query, function(error, rows, fields) {
            if (error) {
                console.log(error.code);
                callback(error);
                return;
            }
            if (rows.length > 1) {
                error = { code: "SAS_MULTIPLE_USER_IDs" };
                console.log(error.code);
                callback(error);
            }else {
                callback(null);
            }
        });
    }
};