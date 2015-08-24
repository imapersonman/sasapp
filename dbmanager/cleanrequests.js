var helper = require("../app/model_helpers");

var query = "SET FOREIGN_KEY_CHECKS = 0;"
            + "DELETE FROM sas_requests;"
            + "ALTER TABLE sas_requests AUTO_INCREMENT = 1;";

helper.query(query, function(error, results) {
    console.log("Successfully cleaned requests.");
    process.exit();
});
