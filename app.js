var express = require("express");
var app = express();
var passport = require("passport");
var flash = require("connect-flash");

var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

var configDB = require("./config/database");

require("./config/passport")(passport);

// app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use("/static", express.static("public"));

// Passport
app.use(session({ secret: "thisisasecretdonttell" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
require("./app/routes/routes")(app, passport);

app.listen(3000);
