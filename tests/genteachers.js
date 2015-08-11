var model = require("../app/ideal_model");

const NTEACHERS = 300;
const NAMELENGTH = 8;

var added = [];

for (var t = 0; t < NTEACHERS; t++) {
    var name = makeName();
    var email = name + "." + t + "@shorelineschools.org";
    var teacher = { name: name, email: email, type: "teacher" };
    added.push(teacher);
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
