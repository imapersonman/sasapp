var User = require("../app/models/User");
console.log("Something is going on...");
User.connect(function(error) {
    User.findByID(27, function(error, user) {
        
    });
});