DELIMITER //

CREATE PROCEDURE FindUserForGoogle
(IN p_google_id VARCHAR(128))
BEGIN
    SELECT name, email, google_id, token FROM users
    WHERE google_id = p_google_id;
END

CREATE PROCEDURE FindUserByEmail
(IN p_google_id VARCHAR(128))
BEGIN
    SELECT name, email, google_id, token FROM users
    WHERE email = p_email;
END

CREATE PROCEDURE FirstLogin
(IN p_google_id VARCHAR(128), p_token VARCHAR(128), p_email VARCHAR(128))
BEGIN
    UPDATE users SET google_id = p_google_id, token = p_token
    WHERE email = p_email;
END

CREATE PROCEDURE FindAllUsers
()
BEGIN
    SELECT id, name, type FROM users;
END

CREATE PROCEDURE FindStudentsForClass
(IN p_class_id INTEGER)
BEGIN
    SELECT id, name, email FROM student_classes
    JOIN users ON student_classes.student_id = users.id
    WHERE student_classes.class_id = p_class_id;
END

CREATE PROCEDURE FindStudentsForTeacher
(IN p_teacher_id INTEGER)
BEGIN
    SELECT id, name, email FROM classes
    WHERE teacher_id = p_teacher_id;
END

CREATE PROCEDURE FindTeachersForStudent
(IN p_student_id INTEGER)
BEGIN
    SELECT users.name, users.email, sas_classes.room_num
    FROM student_classes
    JOIN classes ON student_classes.class_id = classes.id
    JOIN users ON classes.teacher_id = users.id
    JOIN sas_classes ON users.id = sas_classes.teacher_id
    WHERE student_classes.student_id = p_student_id;
END

CREATE PROCEDURE FindRankingsForStudent
(IN p_student_id INTEGER)
BEGIN
    SELECT users.name, sas_classes.room_num, sas_requests.rank
    FROM sas_requests
    JOIN sas_classes
    ON sas_requests.sas_teacher_id = sas_classes.teacher_id
    JOIN users ON users.sas_class_id = sas_classes.id
    WHERE sas_requests.student_id = p_student_id;
END

CREATE PROCEDURE FindRankingsForTeacher
(IN p_teacher_id INTEGER)
BEGIN
    SELECT users.name FROM sas_requests
    JOIN users ON sas_requests.id = users.id;
END

-- This procedure may not work as intended. Test and update comment.
CREATE PROCEDURE FindAllStudents
()
BEGIN
    SELECT users.id, users.name, users.email, users.school_id,
    sas_classes.room_num, schools.name AS school_name
    FROM users
    LEFT JOIN student_sas_classes
    ON student_sas_classes.student_id = users.id
    LEFT JOIN sas_classes
    ON sas_classes.teacher_id = student_sas_classes.sas_teacher_id
    WHERE users.type = 'student';
END

CREATE PROCEDURE FindAllTeachers
()
BEGIN
    SELECT users.id, users.name, users.email, users.school_id,
    sas_classes.room_num, schools.name AS school_name
    FROM users
    LEFT JOIN sas_classes ON users.id = sas_classes.teacher_id
    LEFT JOIN schools ON users.school_id = schools.id
    WHERE users.type = 'teacher';
END

CREATE PROCEDURE FindClass
(IN p_class_id INTEGER)
BEGIN
    SELECT classes.id, classes.name, classes.room_num, classes.period
    users.id AS teacher_id, users.name AS teacher_name, users.email
    FROM classes
    LEFT JOIN users ON classes.teacher_id = users.id
    WHERE classes.id = p_class_id;
END

CREATE PROCEDURE FindAllClasses
()
BEGIN
    SELECT classes.id, classes.name, classes.room_num, classes.period
    users.name AS teacher_name, users.email
    FROM classes
    LEFT JOIN users ON classes.teacher_id = users.id;
END

CREATE PROCEDURE FindAllSASClasses
()
BEGIN
    SELECT sas_classes.teacher_id, sas_classes.room_num,
    sas_classes.student_cap, users.name AS teacher_name
    FROM sas_classes
    LEFT JOIN users ON sas_classes.teacher_id = users.id;
END

CREATE PROCEDURE FindSASClass
(IN p_teacher_id INTEGER)
BEGIN
    SELECT sas_classes.teacher_id, sas_classes.room_num,
    sas_classes.student_cap, users.name AS teacher_name
    FROM sas_classes
    LEFT JOIN users ON sas_classes.teacher_id = users.id
    WHERE sas_classes.teacher_id = p_sas_class_id LIMIT 1;
END

CREATE PROCEDURE FindStudentsForSASClass
(IN p_teacher_id INTEGER)
BEGIN
    SELECT users.id, users.name, users.email
    FROM student_sas_classes
    JOIN users ON student_sas_classes.student_id = users.id
    WHERE student_sas_classes.sas_teacher_id = p_teacher_id;
END

CREATE PROCEDURE FindAllSchools
()
BEGIN
    SELECT id, name, sas_name FROM schools;
END

CREATE PROCEDURE AddStudent
(IN p_name VARCHAR(128), IN p_email VARCHAR(128))
BEGIN
    INSERT INTO users (name, email, type)
    VALUES(p_name, p_email, 'student');
END

CREATE PROCEDURE AddTeacher
(IN p_name VARCHAR(128),
    IN p_email VARCHAR(128), IN p_room_num VARCHAR(16))
BEGIN
    START TRANSACTION;
    INSERT INTO users (name, email) VALUES(p_name, p_email);
    INSERT INTO sas_classes(teacher_id, room_num, student_cap)
    VALUES(LAST_INSERT_ID(), p_room_num, 20);
    COMMIT;
END

CREATE PROCEDURE AddClass
(IN p_name VARCHAR(128), IN p_room_num VARCHAR(16), IN p_period INTEGER)
BEGIN
    INSERT INTO classes (name, room_num, period)
    VALUES (p_name, p_room_num, p_period);
END

CREATE PROCEDURE AddSchool
(IN p_name VARCHAR(128), IN p_sas_name VARCHAR(128))
BEGIN
    INSERT INTO schools (name, sas_name) VALUES (p_name, p_sas_name);
END



DELIMITER ;
