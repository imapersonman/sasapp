var model = require("../app/ideal_model");

const NCLASSES = 300;
const MAXCAP = 40;
const MINCAP = 20;

var added = [];

for (var s = 0; s < NCLASSES; s++) {
    var room_num = "M" + s;
    var student_cap = Math.floor(Math.random()*(MAXCAP-MINCAP)+MINCAP);
    var sas_class = { room_num: room_num, student_cap: student_cap };
    added.push(sas_class);
}

model.addSASClasses(added, function(messages) {
    console.log("Check db");
    process.exit();
});
