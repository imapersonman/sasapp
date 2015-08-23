var helper = require("../app/model_helpers");
var argv = process.argv;
var arg = argv[2];

var params = argv.slice(3);
helper.runProc(arg, params, function(error, results) {
    if (arg == "FindAllProcedures") {
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].Name);
        }
    } else {
        for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
        }
    }
    console.log("\nNumber of entries: " + results.length);
    process.exit();
});
