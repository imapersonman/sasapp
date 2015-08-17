var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

var User = require("../app/models/User");
var model = require("../app/model");
var configAuth = require("./auth");

module.exports = function(passport) {
    
    passport.serializeUser(function(user, done) {
        done(null, user.google_id);
    });
    
    passport.deserializeUser(function(google_id, done) {
        model.findUserForGoogle(google_id, function(error, user) {
            done(error, user);
        });
    });
    
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            var email = profile.emails[0].value;
            model.findUserByEmail(email, function(error, user) {
                if (error) return done(error);
                if (user) {
                    if (profile.id != user.google_id) {
                        console.log("profile_id: " + profile.id);
                        console.log("google_id: " + user.google_id);
                        model.firstLogin(profile.id, token, email, function(error, user) {
                            if (error) return done(error);
                            return done(null, user);
                        });
                    }else {
                        return done(null, user);
                    }
                }else {
                    return done(null, null);
                }
            });
        });
    }));
    
};
