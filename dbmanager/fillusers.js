var fs = require("fs");
var dbh = require("../app/models/User");

var filename = process.argv[2];
var buffer = fs.readFileSync(filename);
var lines = buffer.toString().split("\r\n");
dbh.connect(function(error) {
    if (error) {
        console.log(error.code);
        process.exit();
    }
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if(line.length > 0) {
            var commas = line.split(",");
            var email = commas[0];
            var name = commas[1];
            var type = typeFromEmail(email)
            dbh.createUser(email, name, type, function(error) {
                if(!error) {
                    console.log("Successfully created user.");
                }else {
                    console.log(error.code);
                }
            });
        }
    }
}, function() { });

function typeFromEmail(email) {
    if (email.indexOf("shorelineschools.org") > -1) {
        if(email.indexOf("k12") > -1) {
            return "student";
        }else {
            return "teacher";
        }
    }else {
        return "null";
    }
}