var mysql = require("mysql");
var tables = ["users", "students", "teachers", "classes", "student_classes", "all"];
var dbConf = require("../config/database");
var config = {
    host: "10.0.1.4",
    user: "setup",
    password: "testsetuptest",
    database: "sasapp"
};
var connection = mysql.createConnection(config);

connection.connect(function(error) {
    if(error) {
        console.log(error.code);
        return;
    }else {
        console.log();
        console.log("Successfully connected to database.");
        if (process.argv.length > 3) {
            if (process.argv[2] == "create") {
                for(var i = 3; i < process.argv.length; i++) {
                    if(tables.indexOf(process.argv[i] > -1)) {
                        var arg = process.argv[i];
                        if (arg == "users") {
                            createUserTable();
                        }else if (arg == "students") {
                            createStudentTable();
                        }else if (arg == "teachers") {
                            createTeacherTable();
                        }else if (arg == "classes") {
                            createClassTable();
                        }else if (arg == "student_classes") {
                            createStudentClassTable();
                        }else if (arg == "all") {
                            createUserTable();
                            createStudentTable();
                            createTeacherTable();
                            createClassTable();
                            createStudentClassTable();
                        }
                    }else {
                        console.log("Table '" + process.argv[i] + "' does not exist.");
                        process.exit();
                    }
                }
            }else if (process.argv[2] == "delete") {
                for(var i = 3; i < process.argv.length; i++) {
                    if (tables.indexOf(process.argv[i]) > -1) {
                        if (process.argv[i] == "all" && i == 3) {
                            for(var k = 0; k < tables.length; k++) {
                                drop(tables[k]);
                            }
                        }
                        if(tables.indexOf(process.argv[i] > -1) && process.argv[i] != "all") {
                            drop(process.argv[i]);
                        }else {
                            console.log("Table '" + process.argv[i] + "' does not exist.");
                            process.exit();
                        }
                    }
                }
            }else {
                console.log("Invalid argument '" + process.argv[2] + "'.");
                console.log("Usage: node modtables <create || delete> [tables... ]");
                process.exit();
            }
        }else if (process.argv.length == 3) {
            if (process.argv[2] == "list") {
                console.log("List tables: ");
                for(var i = 0; i < tables.length; i++) {
                    console.log("   - " + tables[i]);
                }
                process.exit();
            }else {
                console.log("Invalid argument '" + process.argv[2] + "'.");
                console.log("Usage: node modtables list");
                process.exit();
            }
        }else {
            console.log("Invalid arguments.");
            console.log("Usage: node modtables <create || delete> [tables... ]");
            process.exit();
        }
    }
});

function createUserTable() {
    var query = "CREATE TABLE " + dbConf.tables.users + " ("
                    + "id INT AUTO_INCREMENT, "
                    + "name VARCHAR(128) NOT NULL,"
                    + "email VARCHAR(128) NOT NULL, "
                    + "type VARCHAR(16) NOT NULL, "
                    + "google_id VARCHAR(128), "
                    + "token VARCHAR(128), "
                    + "PRIMARY KEY (id)"
                + ")";
    connection.query(query, createCallback);
}

function createStudentTable() {
    var query = "CREATE TABLE " + dbConf.tables.students + " ("
                    + "id INT NOT NULL,"
                    + "sas_teacher_id INT,"
                    + "FOREIGN KEY (id) REFERENCES users(id)"
                + ");";
    connection.query(query, createCallback);
}

function createTeacherTable() {
    var query = "CREATE TABLE " + dbConf.tables.teachers + " ("
                    + "id INT NOT NULL,"
                    + "sas_room_num VARCHAR(8) NOT NULL,"
                    + "FOREIGN KEY (id) REFERENCES users(id)"
                + ");";
    connection.query(query, createCallback);
}

function createClassTable() {
    var query = "CREATE TABLE " + dbConf.tables.classes + " ("
                    + "id INT AUTO_INCREMENT,"
                    + "name VARCHAR(128) NOT NULL,"
                    + "room_num VARCHAR(8) NOT NULL"
                + ");";
    connection.query(query, createCallback);
}

function createStudentClassTable() {
    var query = "CREATE TABLE " + dbConf.tables.student_classes + "("
                    + "student_id INT NOT NULL,"
                    + "teacher_id INT NOT NULL,"
                    + "class_id INT NOT NULL,"
                    + "FOREIGN KEY (student_id) REFERENCES " + config.tables.students + "(id),"
                    + "FOREIGN KEY (teacher_id) REFERENCES " + config.tables.teachers + "(id);"
                + ");";
}

function drop(table_name) {
    var query = "DROP TABLE " + table_name;
    connection.query(query, deleteCallback);
}

function createCallback(error, rows, fields) {
    if (error) {
        console.log(error.code);
    }else {
        console.log("Created table");
    }
    process.exit();
}

function deleteCallback(error, rows, fields) {
    if (error) {
        console.log(error.code);
    }else {
        console.log("Deleted table");
    }
    process.exit();
}