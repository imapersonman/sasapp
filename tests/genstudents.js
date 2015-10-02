var model = require("../app/ideal_model");

const NSTUDENTS = 1200;
const NAMELENGTH = 8;

var added = [];

for (var s = 0; s < NSTUDENTS; s++) {
    var name = makeName();
    var email = name + "." + s + "@k12.shorelineschools.org";
    var student = { name: name, email: email, type: "student" };
    added.push(student);
}

model.addUsers(added, function(message) {
    console.log("Check db");
    process.exit();
});

function makeName() {
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var name = "";
    for (var n = 0; n < NAMELENGTH; n++) {
        name += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return name;
}
