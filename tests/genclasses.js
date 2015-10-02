var model = require("../app/ideal_model");

const NCLASSES = 300;
const MAXPERIOD = 6;
const MINPERIOD = 1;
const NAMELENGTH = 16;

var added = [];

for (var c = 0; c < NCLASSES; c++) {
    var name = makeName();
    var room_num = "M" + c;
    var period = Math.floor(Math.random()*(MAXPERIOD-MINPERIOD)+MINPERIOD+1);
    var _class = { name: name, room_num: room_num, period: period };
    added.push(_class);
};

model.addClasses(added, function(messages) {
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
