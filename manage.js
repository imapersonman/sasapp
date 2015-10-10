var child_process = require("child_process");

var scripts = {
    "cleanrequests": "dbmanager/cleanrequests.js",
    "cleantables": "dbmanager/cleantables.js",
    "createtables": "dbmanager/createtables",
    "deletetables": "dbmanager/deletetables.js",
    "fillrequests": "dbmanager/fillrequests.js",
    "filltables": "dbmanager/fillrequrests.js",
    "runalgo": "dbmanager/runalgo.js"
};

var script_name = process.argv[2];
// Selects the arguments after the script.  Arguments are then applied to the
// selected script.
var script_args = process.argv.slice(3);
// Checks to see if the script specified in the argument exists.
if (scripts[script_name] == null) {
    console.log("Error: No script by the name '" + script_name + "'");
    process.exit();
}

// Runs the script as a child process and waits for it to return.
var script_path = scripts[script_name];
var script = child_process.fork(script_path);

// Registering error callback for the script.
script.on("error", function(error) {
    console.log("Error encountered when running script '" + script_name + "'");
    console.log(error);
    process.exit(error);
});

// Registering the exit callback for the script.
script.on("exit", function(code) {
    console.log("Script exited with code " + code);
    process.exit(code);
});
