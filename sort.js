var debug = false;
if (process.argv[2] && process.argv[2] == "debug") {
    debug = true;
}

// I need to define the algorithm before I progrss an further by the
// project.
//
// Instead of being based off of weighting each request, the algorithm
// will be pass based.  A weighting algorithm takes in each request one
// at a time.  While this is great for a concurrent model, which isn't
// even possible in node, it makes it impossible to compare requests in
// a fair manner.
//
// Level one: rank
//      For each rank (-1, 1 -> number of classes) if there are conflicts,
//      move to Level two.  If the request is for that rank, sort student 
//      into corresponding classroom for SAS and delete that request from 
//      the database.  Otherwise move to the next request.
//
//  Level two: timestamp
//      Given a list of conflicting requests (multiple request with the
//      same rank) find the oldest request.  If there is more than one
//      oldest request (requests made at the same time) move to Level
//      three.  Otherwise sort student into corresponding classroom for
//      SAS and delete all the requests in the list.
// 
// Level three: random
//      Given a list of requests with the same timestamp, randomly pick
//      one and sort that student into the corresponding SAS class.
//      Delete the request.  Return to Level one.
//
// As more variables are added to the sorting process, more levels are
// needed for processing.

var mysql = require("mysql");
var config = require("./config/database")
var connection = mysql.createConnection(config);

connection.connect();

function run() {
    var query = "SELECT "
                + "sas_requests.id AS id, "
                + "sas_requests.timestamp AS timestamp, "
                + "sas_requests.rank AS rank, "
                + "student_classes.student_id AS student_id, "
                + "classes.room_num AS room_num "
                + "FROM sas_requests "
                + "JOIN student_classes ON student_classes.id = sas_requests.user_class_id "
                + "JOIN classes ON classes.id = student_classes.class_id " 
                + "ORDER BY student_id, rank"
    connection.query(query, function(error, rows, fields) {
        processError(error, query);
        level_one(rows);
    });
}

var sort_prep = [];
// requests is an array containing all (for now) requests in the
// sas_requests table.
function level_one(requests) {
    var curr_rank_list = [];
    for (var r = 0; r < requests.length - 1; r++) {
        var request = requests[r];
        var next_request = requests[r + 1];
        if (request.student_id == next_request.student_id) {
            curr_rank_list.push(request);
            curr_rank_list.push(next_request);
            if (r < requests.length - 2) r++;
        } else if (curr_rank_list.length > 0) {
            level_two(curr_rank_list);
        } else {
            sort_prep.push(request);
        }
        curr_rank_list = [];
    }
}

// requests is an array containing requests with the same student_id and
// rank.
function level_two(requests) {
    var oldest_request = { timestamp: new Date() };
    for (var r = 0; r < requests.length; r++) {
        var request = requests[r];
        var time_diff = now - request.timestamp;
        if (request.timestamp > oldest_request.timestamp) {
            oldest_request = request;
        }
    }
    sort_prep.push(oldest_request);
}

function sort() {
    var query = "UPDATE users SET room_num = CASE id ";
    var id_string = "(";
    for (var sp = 0; sp < sort_prep.length; sp++) {
        var student_id = mysql.escape(sort_prep[sp].student_id);
        var room_num = mysql.escape(sort_prep[sp].room_num);
        query += "WHEN " + student_id + " THEN " + room_num + " ";
        id_string += student_id;
        if (sp < sort_prep.length - 1) id_string += ",";
    }
    id_string += ")";
    query += "END WHERE room_num IN " + id_string;
    console.log(query);
}

function processError(error, query) {
    if (error) {
        log(error, "error");
        log(query, "query");
        process.exit();
    }
}

function log(query, type) {
    type = type.toUpperCase();
    console.log();
    console.log("===============" + type + "===============");
    console.log(query);
    console.log("=============END " + type + "=============");
    console.log();
}
