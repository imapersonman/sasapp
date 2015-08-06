function User() {
    this.id = null;
    this.name = null;
    this.email = null;
    this.type = null;
    this.google_id = null;
    this.token = null;
}

function Student(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.emaill
    this.type = user.type;
    this.google_id = user.google_id;
    this.token = user.token;
    
    this.sas_teacher_id = null;
    this.teachers = [];
}

function MinStudent() {
    this.name = null;
    this.email = null;
    this.class_name = null;
}

function Teacher(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.emaill
    this.type = user.type;
    this.google_id = user.google_id;
    this.token = user.token;
    
    this.sas_room_number = null;
    this.students = [];
}

function MinTeacher() {
    this.name = null;
    this.email = null;
    this.class_name = null;
    this.sas_room_number;
}

function findUser(google_id, callback) {
    var esc_id = mysql.escape(google_id);
    var uQuery = "SELECT * FROM users WHERE google_id="
                + esc_id;
    connection.query(query, function(error, uRows, fields) {
        if (error) {
            console.log(error.code);
            callback(error, null);
            return;
        }
        var user = uRows[0];
        if (user.type == "student") {
            findStudent(user, function(error, student) {
                if (error) {
                    console.log(error.code);
                    callback(error, null);
                    return;
                }else {
                    callback(null, student);
                }
            });
        }else {
            findTeacher(user, function(error, teacher) {
                if (error) {
                    console.log(error.code);
                    callback(error, null);
                    return;
                }else {
                    callback(null, teacher);
                }
            });
        }
    });
}

function findStudent(user, callback) {
    var esc_id = mysql.escape(user.id);
    var query = "SELECT * FROM students WHERE id=" + esc_id;
    var student = new Student(user);
    connection.query(query, function(error, rows, fields) {
        student.sas_teacher_id = row[0].sas_teacher_id;
        fillTeachers(student, function(error) {
            
        });
    });
}

function findTeacher(user, callback) {
    var esc_id = mysql.escape(user.id);
    var query = "SELECT * FROM teachers WHERE id=" + esc_id;
    var teacher = new Teacher(user);
    connection.query(query, function(error, rows, fields) {
        teacher.sas_room_number = rows[0].sas_room_number;
        fillStudents(teacher, function(error) {
            
        });
    });
}

function fillStudents(teacher, callback) {
    var esc_id = mysql.escape(teacher.id);
    var query = "";
}

// Grab array of teacher id's.
// loop through id's, grab following information.
// users.name, users.email, classes.class_name, teachers.sas_room_number.
// "SELECT users.name, users.email, classes.class_name, teachers.sas_room_number
// FROM users
// JOIN classes
// JOIN teachers
// ON users.id=classes.teacher_id AND classes.teacher_id=teachers.id
// WHERE users.id=" + teacher.id;
function fillTeachers(student, callback) {
    var esc_id = mysql.escape(student.id);
    var query = "SELECT * FROM student_classes WHERE student_id=" + esc_id;
    connection.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error.code);
            callback(error, null);
            return;
        }else {
            for(var i = 0; i < rows.length; i++) {
                var query = "SELECT users.name, users.email, classes.class_name, teachers.sas_room_number "
                            + "FROM users "
                            + "JOIN classes "
                            + "JOIN teachers "
                            + "ON users.id=classes.teacher_id AND classes.teacher_id=teachers.id"
                            + "WHERE users.id=" + rows[i].teacher_id;
                collection.query(query, function(error, rows, fields) {
                    if (error) {
                        console.log(error.code);
                        callback(error, null);
                        return;
                    }else {
                        var teacher = new MinTeacher();
                        var row = rows[0];
                        teacher.name = row.name;
                        teacher.email = row.email;
                        teacher.class_name = row.class_name;
                        teacher.sas_room_number = row.sas_room_number;
                        student.teachers.push(teacher);
                    }
                });
            }
        }
    });
}