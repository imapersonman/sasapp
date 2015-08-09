var model = require("../ideal_model");

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
            console.log("I don't get it");
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
        model.findAllClasses(function(classList) {
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
        model.findAllClasses(function(classList) {
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
        model.findClass(class_id, function(_class) {
            model.findAllStudents(function(all_students) {
                model.findAllTeachers(function(all_teachers) {
                    model.findStudentsForClass(class_id, function(students) {
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
        model.findAllStudents(function(studentList) {
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
        model.findAllStudents(function(studentList) {
            var studentList = (studentList) ? studentList : [];
            var object = {
                page: "edit_students",
                title: "Edit Students",
                user: request.user,
                students: studentList
            };
            response.render("admin", object);
        });
    });

    app.get("/user/teachers", isLoggedIn, isAdmin, function(request, response) {
        model.findAllTeachers(function(teacherList) {
            var teacherList = (teacherList) ? teacherList : [];
            var object = {
                page: "teachers",
                title: "View Teachers",
                user: request.user,
                teachers: teacherList
            };
            response.render("admin", object);
        });
    });

    // This page should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Teachers do not be edited on the individual or batch level.
    app.get("/user/teachers/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSASClasses(function(sas_classes) {
            var sas_classes = (sas_classes) ? sas_classes : [];
            model.findAllTeachers(function(teacherList) {
                var teacherList = (teacherList) ? teacherList : [];
                var object = {
                    page: "edit_teachers",
                    title: "Edit Teachers",
                    user: request.user,
                    teachers: teacherList,
                    sas_classes: sas_classes
                };
                response.render("admin", object);
            });
        });
    });

    app.get("/user/sas_classes", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSASClasses(function(sas_classes) {
            var sas_classes = (sas_classes) ? sas_classes : [];
            var object = {
                page: "sas_classes",
                title: "SAS Classes",
                user: request.user,
                sas_classes: sas_classes
            };
            response.render("admin", object);
        });
    });

    app.get("/user/sas_classes/edit", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSASClasses(function(sas_classes) {
            var sas_classes = (sas_classes) ? sas_classes : [];
            var object = {
                page: "edit_sas_classes",
                title: "Edit SAS Classes",
                user: request.user,
                sas_classes: sas_classes
            };
            response.render("admin", object);
        });
    });

    app.get("/user/schools", isLoggedIn, isAdmin, function(request, response) {
        model.findAllSchools(function(schools) {
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
        model.findAllSchools(function(schools) {
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
    app.post("/model/update/teacher", isLoggedIn, isAdmin, function(request, response) {
        var editedTeachers = (request.body.editedTeachers) ? JSON.parse(request.body.editedTeachers) : [];
        var addedTeachers = (request.body.addedTeachers) ? JSON.parse(request.body.addedTeachers) : [];
        var removedTeachers = (request.body.removedTeachers) ? JSON.parse(request.body.removedTeachers) : [];
        var disp_messages = [];
        if (Object.keys(editedTeachers).length > 0) {
            model.updateTeachers(editedTeachers, function(messages) {
                // Something
            });
        }
        if (Object.keys(addedTeachers).length > 0) {
            model.addUsers(addedTeachers, function(messages) {
                // Something
            });
        }
        if (Object.keys(removedTeachers).length > 0) {
            model.removeUsers(removedTeachers, function(messages) {
                // Something
            });
        }
        response.send(disp_messages);
    });

    // This form should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    app.post("/model/update/student", isLoggedIn, isAdmin, function(request, response) {
        var editedStudents = (request.body.editedStudents) ? JSON.parse(request.body.editedStudents) : null;
        var addedStudents = (request.body.addedStudents) ? JSON.parse(request.body.addedStudents) : null;
        var removedStudents = (request.body.removedStudents) ? JSON.parse(request.body.removedStudents) : null;
        var disp_messages = [];
        if (Object.keys(editedStudents).length > 0) {
            model.updateStudents(editedStudents, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        if (Object.keys(addedStudents).length > 0) {
            model.addUsers(addedStudents, function(messages) {
                    disp_messages.push("Something went wrong with the server.")
                    disp_messages.concat(messages);
            });
        }
        if (Object.keys(removedStudents).length > 0) {
            model.removeUsers(removedStudents, function(error, messages) {
                if (error) {
                    disp_messages.push("Something went wrong with the server.")
                    disp_messages.concat(messages);
                }
            });
        }
        response.send(disp_messages);
    });

    // This form should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    app.post("/model/update/class", isLoggedIn, isAdmin, function(request, response) {
        var editedClasses = (request.body.editedClasses) ? JSON.parse(request.body.editedClasses) : null;
        var addedClasses = (request.body.addedClasses) ? JSON.parse(request.body.addedClasses) : null;
        var removedClasses = (request.body.removedClasses) ? JSON.parse(request.body.removedClasses) : null;
        var disp_messages = [];
        if (Object.keys(editedClasses).length > 0) {
            model.updateClasses(editedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        if (Object.keys(addedClasses).length > 0) {
            model.addClasses(addedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        if (Object.keys(removedClasses).length > 0) {
            model.removeClasses(removedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        response.send(disp_messages);
    });

    app.post("/model/update/sas_class", isLoggedIn, isAdmin, function(request, response) {
        var editedClasses = (request.body.editedClasses) ? JSON.parse(request.body.editedClasses) : null 
        var addedClasses = (request.body.addedClasses) ? JSON.parse(request.body.addedClasses) : null 
        var removedClasses = (request.body.removedClasses) ? JSON.parse(request.body.removedClasses) : null;
        var disp_messages = [];
        if (Object.keys(editedClasses).length > 0) {
            model.updateSASClasses(editedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        if (Object.keys(addedClasses).length > 0) {
            model.addSASClasses(addedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        if (Object.keys(removedClasses).length > 0) {
            model.removeSASClasses(removedClasses, function(messages) {
                disp_messages.push("Something went wrong with the server.")
                disp_messages.concat(messages);
            });
        }
        response.send(disp_messages);
    });

    app.post("/model/update/schools", isLoggedIn, isAdmin, function(request, response) {
        var editedTeachers = (request.body.editedTeachers) ? JSON.parse(request.body.editedTeachers) : [];
        var addedTeachers = (request.body.addedTeachers) ? JSON.parse(request.body.addedTeachers) : [];
        var removedTeachers = (request.body.removedTeachers) ? JSON.parse(request.body.removedTeachers) : [];
        var disp_messages = [];
        if (Object.keys(editedTeachers).length > 0) {
            model.updateSchools(editedTeachers, function(messages) {
                // Something
            });
        }
        if (Object.keys(addedTeachers).length > 0) {
            model.addSchools(addedTeachers, function(messages) {
                // Something
            });
        }
        if (Object.keys(removedTeachers).length > 0) {
            model.removeSchools(removedTeachers, function(messages) {
                // Something
            });
        }
        response.send(disp_messages);
    });

    // This form should not be needed in the future.  If all goes well all the information
    // on individual classes will be taken from external sources supplied by the district.
    // Classes do not be edited on the individual or batch level.
    app.post("/model/update/class/students", isLoggedIn, isAdmin, function(request, response) {
        console.log("received");
        var class_id = request.body.class_id;
        var students = JSON.parse(request.body.students);
        model.addStudentsToClass(class_id, students, function(messages) {
            response.end(JSON.stringify(messages));
        });
    });

    app.post("/model/remove/class/students", isLoggedIn, isAdmin, function(request, response) {
        console.log("received");
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
