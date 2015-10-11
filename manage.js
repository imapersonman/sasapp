var child_process = require("child_process");

var scripts = {
    "cleanrequests": __dirname + "/scripts/cleanrequests.js",
    "cleantables": __dirname + "/scripts/cleantables.js",
    "createtables": __dirname + "/scripts/createtables",
    "fillrequests": __dirname + "/scripts/fillrequests.js",
    "filltables": __dirname + "/scripts/fillrequrests.js",
    "runalgo": __dirname + "/scripts/runalgo.js",
    "startserver": __dirname + "/app.js"
};

// Processes flags
if (process.argv[2] === "-l") {
    var script_keys = Object.keys(scripts);
    // Prints out all the runnable scripts.
    for (var key_index = 0; key_index < script_keys.length; key_index++) {
        console.log(script_keys[key_index]);
    }
    process.exit();
}

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
