var sort = require("../sort");


const NSTUDENTS = 100;
const NPERIODS = 7;
const NRANKS = NPERIODS;
const MAXREQUESTS = 6;

exports.run = function() {
    var requests = [];
    for (var i = 0; i < NSTUDENTS; i++) {
        var request = {};
        request.student_id = i;
        request.timestamp = new Date();
        for (var r = 0; r < random_int(1, MAXREQUESTS); r++) {
            request.rank = r;
            request.room_num = "M" + random_int(0, 400);
            requests.push(request);
        }
    }
    console.log("REQUESTS BEFORE");
    for (var r = 0; r < requests.length; r++) {
        var re = requests[r];
        console.log("id:" + re.student_id + ", rank:" + re.rank + ", timestamp:" + re.timestamp + ", room_num:" + re.room_num);
    }
    console.log();
    sort.level_one(requests);
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
