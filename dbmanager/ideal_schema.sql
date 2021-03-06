CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(128) NOT NULL,
	`email` varchar(128) NOT NULL,
	`google_id` varchar(128),
	`token` varchar(128),
	`type` varchar(48) NOT NULL,
	`sas_teacher_id` INT,
	`school_id` INT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `classes` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`teacher_id` INT,
	`name` varchar(128) NOT NULL,
	`room_num` varchar(8) NOT NULL,
	`period` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `sas_requests` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`student_id` INT NOT NULL,
	`sas_class_id` INT NOT NULL,
	`timestamp` TIMESTAMP NOT NULL,
	`rank` INT,
	`weight` FLOAT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `student_classes` (
	`student_id` INT NOT NULL,
	`class_id` INT NOT NULL
);

CREATE TABLE `schools` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(128) NOT NULL,
	`sas_name` varchar(128) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `sas_classes` (
	`teacher_id` INT NOT NULL,
	`room_num` varchar(16) NOT NULL,
	`student_cap` INT
);

ALTER TABLE `users` ADD CONSTRAINT `users_fk0` FOREIGN KEY (`sas_teacher_id`) REFERENCES `sas_classes`(`teacher_id`);

ALTER TABLE `users` ADD CONSTRAINT `users_fk1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`);

ALTER TABLE `classes` ADD CONSTRAINT `classes_fk0` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`);

ALTER TABLE `sas_requests` ADD CONSTRAINT `sas_requests_fk0` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`);

ALTER TABLE `sas_requests` ADD CONSTRAINT `sas_requests_fk1` FOREIGN KEY (`sas_class_id`) REFERENCES `sas_classes`(`id`);

ALTER TABLE `student_classes` ADD CONSTRAINT `student_classes_fk0` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`);

ALTER TABLE `student_classes` ADD CONSTRAINT `student_classes_fk1` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`);

ALTER TABLE `sas_classes` ADD CONSTRAINT `sas_classes_fk0` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`);

