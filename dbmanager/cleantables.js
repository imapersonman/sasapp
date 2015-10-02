var h = require("../app/model_helpers.js");

var query = "SET FOREIGN_KEY_CHECKS = 0;"
            + "DELETE FROM users;"
            + "DELETE FROM classes;"
            + "DELETE FROM sas_classes;"
            + "DELETE FROM student_classes;"
            + "DELETE FROM student_sas_classes;"
            + "SET FOREIGN_KEY_CHECKS = 1;"
            + "ALTER TABLE users AUTO_INCREMENT = 1;"
            + "ALTER TABLE classes AUTO_INCREMENT = 1;"
            + "ALTER TABLE sas_classes AUTO_INCREMENT = 1;"
            + "ALTER TABLE student_sas_classes AUTO_INCREMENT = 1;"
            + "SET FOREIGN_KEY_CHECKS = 1;";

h.query(query, function(error, results) {
    console.log("Successfully cleaned tables.");
    process.exit();
});
