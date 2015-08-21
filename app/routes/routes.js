var model = require("../model");

module.exports = function(app, passport) {

    app.get("/", isNotLoggedIn, function(request, response) {
        response.render("index");
    });

    app.get("/user", isLoggedIn, function(request, response) {
        var type = request.user.type;
        var page_type = "";
        var object = {
            user: request.user
        };
        if (type == "admin") {
            object.title = "Admin Dashboard";
            object.page = "dashboard";
            page_type = "admin";
        } else {
            page_type = "user";
            if (type == "student") {
                object.title = "Student Dashboard";
                object.page = "student_dash";
            } else if (type == "teacher") {
                object.title = "Teacher Dashboard";
                object.page = "teacher_dash";
            } else {
                response.redirect("/");
            }
        }
        response.render(page_type, object);
    });

    app.get("/user/classes", isLoggedIn, isAdmin, function(request, response) {
        model.findAllClasses(function(error, classList) {
            var realClassList = (classList == null) ? [] : classList;
            var object = {
                page: "classes",
                title: "View Classes",
                user: request.user,
                classes: realClassList
            };
            response.render("admin", object);
        });
    });

    // This page should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    app.get("/user/classes/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllClasses(function(error, classList) {
            var realClassList = (classList == null) ? [] : classList;
            var object = {
                page: "edit_classes",
                title: "Edit Classes",
                user: request.user,
                classes: realClassList
            };
            response.render("admin", object);
        });
    });

    // This page should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    // ============================
    // Things to send to the client
    // ============================
    // + _class: An object representing the overall class
    //          - Name
    //          - Period
    // + class_students: An array of student objects
    // + all_students: An array of all students
    // + class_teacher: A user object representing the class teacher
    // + all_teachers: AN array of all teachers
    app.get("/user/classes/edit/:class_id", isLoggedIn, isAdmin, function(request, response) {
        Array.prototype.diff = function(a) {
            return this.filter(function(i) {return a.indexOf(i) < 0;});
        };
        var class_id = request.params.class_id;
        model.findClass(class_id, function(error, _class) {
            model.findAllStudents(function(error, all_students) {
                model.findAllTeachers(function(error, all_teachers) {
                    model.findStudentsForClass(class_id, function(error, students) {
                        all_students = userArrayDiff(all_students, students);
                        var object = {
                            page: "edit_class",
                            title: "Edit Class",
                            _class: _class,
                            students: students,
                            all_students: all_students,
                            all_teachers: all_teachers
                        };
                        response.render("admin", object);
                    });
                });
            });
        });
    });

    app.get("/user/sas_classes/edit/:sas_class_id", isLoggedIn, isAdmin, function(request, response) {
        Array.prototype.diff = function(a) {
            return this.filter(function(i) {return a.indexOf(i) < 0;});
        };
        var sas_class_id = request.params.sas_class_id;
        model.findSASClass(sas_class_id, function(sas_class) {
            model.findAllTeachers(function(all_teachers) {
                model.findStudentsForSASClass(sas_class_id, function(students) {
                    var object = {
                        page: "edit_sas_class",
                        title: "Edit SAS Class",
                        sas_class: sas_class,
                        students: students,
                        all_teachers: all_teachers
                    };
                    response.render("admin", object);
                });
            });
        });
    });

    app.get("/user/students", isLoggedIn, isAdmin, function(request, response) {
        model.findAllStudents(function(error, studentList) {
            var studentList = (studentList) ? studentList : [];
            var object = {
                page: "students",
                title: "View Students",
                user: request.user,
                students: studentList
            };
            response.render("admin", object);
        });
    });

    // This page should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Students do not be edited on the individual or batch level.
    app.get("/user/students/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(error, schools) {
            model.findAllStudents(function(error, studentList) {
                var studentList = (studentList) ? studentList : [];
                var object = {
                    page: "edit_students",
                    title: "Edit Students",
                    user: request.user,
                    students: studentList,
                    schools: schools
                };
                response.render("admin", object);
            });
        });
    });

    app.get("/user/teachers", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(error, schools) {
            model.findAllTeachers(function(error, teacherList) {
                var teacherList = (teacherList) ? teacherList : [];
                var object = {
                    page: "teachers",
                    title: "View Teachers",
                    user: request.user,
                    teachers: teacherList,
                    schools: schools
                };
                response.render("admin", object);
            });
        });
    });

    // This page should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Teachers do not be edited on the individual or batch level.
    app.get("/user/teachers/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(error, schools) {
            model.findAllSASClasses(function(error, sas_classes) {
                var sas_classes = (sas_classes) ? sas_classes : [];
                model.findAllTeachers(function(error, teacherList) {
                    var teacherList = (teacherList) ? teacherList : [];
                    var object = {
                        page: "edit_teachers",
                        title: "Edit Teachers",
                        user: request.user,
                        teachers: teacherList,
                        sas_classes: sas_classes,
                        schools: schools
                    };
                    response.render("admin", object);
                });
            });
        });
    });

    app.get("/user/schools", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(error, schools) {
            var schools = (schools) ? schools : [];
            var object = {
                page: "schools",
                title: "Schools",
                user: request.user,
                schools: schools
            };
            response.render("admin", object);
        });
    });

    app.get("/user/schools/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(error, schools) {
            var schools = (schools) ? schools : [];
            var object = {
                page: "edit_schools",
                title: "Edit Schools",
                user: request.user,
                schools: schools
            };
            response.render("admin", object);
        });
    });

    // This form should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Teachers do not be edited on the individual or batch level.
    app.post("/model/edit/:field", isLoggedIn, isAdmin, function(request, response) {
        var edited = (request.body.edited) ? JSON.parse(request.body.edited) : null;
        var added = (request.body.added) ? JSON.parse(request.body.added) : null;
        var removed = (request.body.removed) ? JSON.parse(request.body.removed) : null;
        var field = request.params.field;
        var disp_messages = [];
        var update_function = null;
        var add_function = null;
        var remove_function = null;
        // This can be further factored with the user of an array of editable objects.
        // Do later.
        if (field == "teachers") {
            update_function = model.updateTeachers;
            add_function = model.addTeachers;
            remove_function = model.removeTeachers;
        } else if (field == "students") {
            update_function = model.updateStudents;
            add_function = model.addStudents;
            remove_function = model.removeStudents;
        } else if (field == "classes") {
            update_function = model.updateClasses;
            add_function = model.addClasses;
            remove_function = model.removeClasses;
        } else if (field == "schools") {
            update_function = model.updateSchools;
            add_function = model.addSchools;
            remove_function = model.removeSchools;
        } else {
            // The field is not recognized, do something.
            response.redirect("/");
        }
        if (Object.keys(edited).length > 0) {
            update_function(edited, function(error, messages) {
                // Something
            });
        }
        if (Object.keys(added).length > 0) {
            add_function(added, function(error, messages) {
                // Something
            });
        }
        if (Object.keys(removed).length) {
            remove_function(removed, function(error, messages) {
                // Something
            });
        }
        response.send(disp_messages);
    });

    // This form should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    app.post("/model/update/class/students", isLoggedIn, isAdmin, function(request, response) {
        var class_id = request.body.class_id;
        var students = JSON.parse(request.body.students);
        console.log("Students: " + request.body.students);
        model.addStudentsToClass(class_id, students, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/remove/class/students", isLoggedIn, isAdmin, function(request, response) {
        var class_id = request.body.class_id;
        var students = JSON.parse(request.body.students);
        model.removeStudentsFromClass(class_id, students, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/update/class/teacher", isLoggedIn, isAdmin, function(request, response) {
        var class_id = request.body.class_id;
        var teacher_id = request.body.teacher_id;
        model.updateClassTeacher(class_id, teacher_id, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/update/sas_class/student_cap", isLoggedIn, isAdmin, function(request, response) {
        var sas_class_id = request.body.sas_class_id;
        var student_cap = request.body.student_cap;
        model.updateSASCap(sas_class_id, student_cap, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/find/student_classes", isLoggedIn, isStudent, function(request, response) {
        var student_id = request.body.student_id;
        model.findTeachersForStudent(student_id, function(teachers) {
            response.end(JSON.stringify(teachers));
        });
    });

    app.post("/model/find/teacher_students", isLoggedIn, isTeacher, function(request, response) {
        var teacher_id = request.body.teacher_id;
        model.findStudentsForTeacher(teacher_id, function(students) {
            response.end(JSON.stringify(students));
        });
    });

    app.post("/model/find/rankings", isLoggedIn, isStudent, function(request, response) {
        var student_id = request.body.student_id;
        model.findRankingsForStudent(student_id, function(rankings) {
            response.end(JSON.stringify(rankings));
        });
    });

    app.post("/model/student/request", isLoggedIn, isStudent, function(request, response) {
        var ranks = JSON.parse(request.body.ranks);
        model.addSASRequests(ranks, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/teacher/request", isLoggedIn, isTeacher, function(request, response) {
        var students = JSON.parse(request.body.students);
        model.addTeacherSASRequests(students, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.get("/logout", function(request, response) {
        request.session.destroy(function(error) {
            request.logout();
            response.redirect("/");
        });
    });

    /* Google routes. */
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    // Callback
    app.get("/auth/google/callback",
           passport.authenticate("google", {
        successRedirect: "/user",
        failureRedirect: "/"
    }));

    function isLoggedIn(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        }
        response.redirect("/");
    }

    function isAdmin(request, response, next) {
        if (request.user.type == "admin") {
            return next();
        }
        response.redirect("/user");
    }

    function isStudent(request, response, next) {
        if (request.user.type == "student") {
            return next();
        }
        response.redirect("/user");
    }

    function isTeacher(request, response, next) {
        if (request.user.type == "teacher") {
            return next();
        }
        response.redirect("/user");
    }

    function isNotLoggedIn(request, response, next) {
        if(!request.isAuthenticated()) {
            return next();
        }
        response.redirect("/user");
    }

    function studentsToIDArray(students) {
        var ids = [];
        for (var s = 0; s < students.length; s++) {
            ids.push(students[s].id);
        }
        return ids;
    }

    function userArrayDiff(a, b) {
        var users = [];
        var matches = false;
        for (var ai = 0; ai < a.length; ai++) {
            for (var bi = 0; bi < b.length; bi++) {
                if (a[ai].id == b[bi].id) matches = true;
            }
            if (!matches) users.push(a[ai]);
            matches = false;
        }
        return users;
    }

};
