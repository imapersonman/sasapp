DELIMITER //

DROP PROCEDURE IF EXISTS FindUserForGoogle//
CREATE PROCEDURE FindUserForGoogle
(IN p_google_id VARCHAR(128))
BEGIN
    SELECT id, name, email, type, google_id, token
    FROM users
    WHERE google_id = p_google_id;
END//


DROP PROCEDURE IF EXISTS FindUserByEmail//
CREATE PROCEDURE FindUserByEmail
(IN p_email VARCHAR(128))
BEGIN
    SELECT name, email, google_id, token FROM users WHERE email = p_email
    AND deleted = 0;
END//

DROP PROCEDURE IF EXISTS FirstLogin//
CREATE PROCEDURE FirstLogin
(IN p_google_id VARCHAR(128), p_token VARCHAR(128), p_email VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE users SET google_id = p_google_id, token = p_token
    WHERE email = p_email;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS FindAllUsers//
CREATE PROCEDURE FindAllUsers
()
BEGIN
    SELECT id, name, type FROM users;
END//

DROP PROCEDURE IF EXISTS FindStudentsForClass//
CREATE PROCEDURE FindStudentsForClass
(IN p_class_id INTEGER)
BEGIN
    SELECT id, name, email FROM student_classes
    JOIN users ON student_classes.student_id = users.id
    WHERE student_classes.class_id = p_class_id;
END//

DROP PROCEDURE IF EXISTS FindStudentsForTeacher//
CREATE PROCEDURE FindStudentsForTeacher
(IN p_teacher_id INTEGER)
BEGIN
    SELECT users.id, users.name, users.email FROM classes
    JOIN student_classes ON student_classes.class_id = classes.id
    JOIN users ON student_classes.student_id = users.id
    WHERE classes.teacher_id = p_teacher_id;
END//

DROP PROCEDURE IF EXISTS FindTeachersForStudent//
CREATE PROCEDURE FindTeachersForStudent
(IN p_student_id INTEGER)
BEGIN
    SELECT users.id, users.name, users.email, sas_classes.room_num
    FROM student_classes
    JOIN classes ON student_classes.class_id = classes.id
    JOIN users ON classes.teacher_id = users.id
    JOIN sas_classes ON users.id = sas_classes.teacher_id
    WHERE student_classes.student_id = p_student_id;
END//

DROP PROCEDURE IF EXISTS FindRankingsForStudent//
CREATE PROCEDURE FindRankingsForStudent
(IN p_student_id INTEGER)
BEGIN
    SELECT users.name, sas_classes.room_num, sas_requests.rank
    FROM sas_requests
    JOIN sas_classes
    ON sas_requests.sas_teacher_id = sas_classes.teacher_id
    JOIN users ON sas_classes.teacher_id = users.id
    AND sas_requests.rank != -1;
END//

DROP PROCEDURE IF EXISTS FindRankingsForTeacher//
CREATE PROCEDURE FindRankingsForTeacher
(IN p_teacher_id INTEGER)
BEGIN
    SELECT users.name FROM sas_requests
    JOIN users ON sas_requests.id = users.id;
END//

DROP PROCEDURE IF EXISTS FindAllStudents//
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
    LEFT JOIN schools ON schools.id = users.school_id
    WHERE users.type = 'student';
END//

DROP PROCEDURE IF EXISTS FindAllTeachers//
CREATE PROCEDURE FindAllTeachers
()
BEGIN
    SELECT users.id, users.name, users.email, users.school_id,
    sas_classes.room_num, schools.name AS school_name
    FROM users
    LEFT JOIN sas_classes ON users.id = sas_classes.teacher_id
    LEFT JOIN schools ON users.school_id = schools.id
    WHERE users.type = 'teacher';
END//

DROP PROCEDURE IF EXISTS FindClass//
CREATE PROCEDURE FindClass
(IN p_class_id INTEGER)
BEGIN
    SELECT classes.id, classes.name, classes.room_num, classes.period,
    users.id AS teacher_id, users.name AS teacher_name, users.email
    FROM classes
    LEFT JOIN users ON classes.teacher_id = users.id
    WHERE classes.id = p_class_id;
END//

DROP PROCEDURE IF EXISTS FindAllClasses//
CREATE PROCEDURE FindAllClasses
()
BEGIN
    SELECT classes.id, classes.name, classes.room_num, classes.period,
    users.name AS teacher_name, users.email
    FROM classes
    LEFT JOIN users ON classes.teacher_id = users.id;
END//

DROP PROCEDURE IF EXISTS FindAllSASClasses//
CREATE PROCEDURE FindAllSASClasses
()
BEGIN
    SELECT sas_classes.teacher_id, sas_classes.room_num,
    sas_classes.student_cap, users.name AS teacher_name
    FROM sas_classes
    LEFT JOIN users ON sas_classes.teacher_id = users.id;
END//

DROP PROCEDURE IF EXISTS FindSASClass//
CREATE PROCEDURE FindSASClass
(IN p_teacher_id INTEGER)
BEGIN
    SELECT sas_classes.teacher_id, sas_classes.room_num,
    sas_classes.student_cap, users.name AS teacher_name
    FROM sas_classes
    LEFT JOIN users ON sas_classes.teacher_id = users.id
    WHERE sas_classes.teacher_id = p_sas_class_id LIMIT 1;
END//

DROP PROCEDURE IF EXISTS FindStudentsForSASClass//
CREATE PROCEDURE FindStudentsForSASClass
(IN p_teacher_id INTEGER)
BEGIN
    SELECT users.id, users.name, users.email
    FROM student_sas_classes
    JOIN users ON student_sas_classes.student_id = users.id
    WHERE student_sas_classes.sas_teacher_id = p_teacher_id;
END//

DROP PROCEDURE IF EXISTS FindAllSchools//
CREATE PROCEDURE FindAllSchools
()
BEGIN
    SELECT id, name, sas_name FROM schools;
END//

DROP PROCEDURE IF EXISTS AddStudent//
CREATE PROCEDURE AddStudent
(IN p_name VARCHAR(128), IN p_email VARCHAR(128))
BEGIN
    START TRANSACTION;
    INSERT INTO users (name, email, type)
    VALUES(p_name, p_email, 'student');
    COMMIT;
END//

DROP PROCEDURE IF EXISTS AddTeacher//
CREATE PROCEDURE AddTeacher
(IN p_name VARCHAR(128),
    IN p_email VARCHAR(128), IN p_room_num VARCHAR(16))
BEGIN
    START TRANSACTION;
    INSERT INTO users (name, email, type) VALUES(p_name, p_email, 'teacher');
    INSERT INTO sas_classes(teacher_id, room_num, student_cap)
    VALUES(LAST_INSERT_ID(), p_room_num, 20);
    COMMIT;
END//

DROP PROCEDURE IF EXISTS AddClass//
CREATE PROCEDURE AddClass
(IN p_name VARCHAR(128), IN p_room_num VARCHAR(16), IN p_period INTEGER)
BEGIN
    START TRANSACTION;
    INSERT INTO classes (name, room_num, period)
    VALUES (p_name, p_room_num, p_period);
    COMMIT;
END//

DROP PROCEDURE IF EXISTS AddSchool//
CREATE PROCEDURE AddSchool
(IN p_name VARCHAR(128), IN p_sas_name VARCHAR(128))
BEGIN
    START TRANSACTION;
    INSERT INTO schools (name, sas_name) VALUES (p_name, p_sas_name);
    COMMIT;
END//

DROP PROCEDURE IF EXISTS AddStudentToClass//
CREATE PROCEDURE AddStudentToClass
(IN p_class_id INTEGER, IN p_student_id INTEGER)
BEGIN
    START TRANSACTION;
    INSERT INTO student_classes (class_id, student_id)
    VALUES(p_class_id, p_student_id);
    COMMIT;
END//

DROP PROCEDURE IF EXISTS AddSASRequest//
CREATE PROCEDURE AddSASRequest
(IN p_student_id INTEGER, IN p_teacher_id INTEGER, IN p_rank INTEGER)
BEGIN
    START TRANSACTION;
    INSERT INTO sas_requests
    (student_id, sas_teacher_id, rank, timestamp)
    VALUES (p_student_id, p_teacher_id, p_rank, NOW());
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateUserName//
CREATE PROCEDURE UpdateUserName
(IN p_student_id INTEGER, IN p_student_name VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE users SET name = p_student_name WHERE id = p_student_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateUserEmail//
CREATE PROCEDURE UpdateUserEmail
(IN p_student_id INTEGER, IN p_student_email VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE users SET email = p_student_email WHERE id = p_student_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateUserSchool//
CREATE PROCEDURE UpdateUserSchool
(IN p_student_id INTEGER, IN p_student_school_id INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE users SET school_id = p_student_school_id
    WHERE id = p_student_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateTeacherRoom//
CREATE PROCEDURE UpdateTeacherRoom
(IN p_teacher_id INTEGER, IN p_teacher_room VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE sas_classes SET room_num = p_teacher_room
    WHERE teacher_id = p_teacher_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateClassName//
CREATE PROCEDURE UpdateClassName
(IN p_class_id INTEGER, IN p_class_name VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE classes SET name = p_class_name
    WHERE id = p_class_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateClassRoom//
CREATE PROCEDURE UpdateClassRoom
(IN p_class_id INTEGER, IN p_class_room_num VARCHAR(16))
BEGIN
    START TRANSACTION;
    UPDATE classes SET room_num = p_class_room_num
    WHERE id = p_class_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateClassPeriod//
CREATE PROCEDURE UpdateClassPeriod
(IN p_class_id INTEGER, IN p_class_period INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE classes SET period = p_class_period
    WHERE id = p_class_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateSchoolName//
CREATE PROCEDURE UpdateSchoolName
(IN p_school_id INTEGER, IN p_school_name VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE schools SET name = p_school_name
    WHERE id = p_school_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateSchoolSASName//
CREATE PROCEDURE UpdateSchoolSASName
(IN p_school_id INTEGER, IN p_school_sas_name VARCHAR(128))
BEGIN
    START TRANSACTION;
    UPDATE schools SET sas_name = p_school_sas_name
    WHERE id = p_school_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS UpdateClassTeacher//
CREATE PROCEDURE UpdateClassTeacher
(IN p_class_id INTEGER, IN p_teacher_id INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE classes SET teacher_id = p_teacher_id
    WHERE id = p_class_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS RemoveStudent//
CREATE PROCEDURE RemoveStudent
(IN p_student_id INTEGER)
BEGIN
    START TRANSACTION;
    DELETE FROM student_classes WHERE student_id = p_student_id;
    DELETE FROM sas_requests WHERE student_id = p_student_id;
    DELETE FROM student_sas_classes WHERE student_id = p_student_id;
    DELETE FROM users WHERE id = p_student_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS RemoveTeacher//
CREATE PROCEDURE RemoveTeacher
(IN p_teacher_id INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE classes SET teacher_id = NULL WHERE teacher_id = p_teacher_id;
    DELETE FROM sas_requests WHERE sas_teacher_id = p_teacher_id;
    DELETE FROM sas_classes WHERE teacher_id = p_teacher_id;
    DELETE FROM users WHERE id = p_teacher_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS RemoveClass//
CREATE PROCEDURE RemoveClass
(IN p_class_id INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE classes SET deleted = TRUE WHERE id = p_class_id;
    DELETE FROM classes WHERE id = p_class_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS RemoveSchool//
CREATE PROCEDURE RemoveSchool
(IN p_school_id INTEGER)
BEGIN
    START TRANSACTION;
    UPDATE schools SET deleted = 1 WHERE id = p_school_id;
    DELETE FROM schools WHERE id = p_school_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS RemoveStudentFromClass//
CREATE PROCEDURE RemoveStudentFromClass
(IN p_class_id INTEGER, IN p_student_id INTEGER)
BEGIN
    START TRANSACTION;
    DELETE FROM student_classes WHERE class_id = p_class_id
    AND student_id = p_student_id;
    COMMIT;
END//

DROP PROCEDURE IF EXISTS FindAllProcedures//
CREATE PROCEDURE FindAllProcedures
()
BEGIN
    SHOW PROCEDURE STATUS;
END//

DROP PROCEDURE IF EXISTS FindAllRequests//
CREATE PROCEDURE FindAllRequests
()
BEGIN
    SELECT * FROM sas_requests ORDER BY rank, timestamp;
END//

DROP PROCEDURE IF EXISTS RemoveRequest//
CREATE PROCEDURE RemoveRequest
(IN p_request_id INTEGER)
BEGIN
    DELETE FROM sas_requests WHERE id = p_request_id;
END//

DELIMITER ;
