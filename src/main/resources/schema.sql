CREATE DATABASE IF NOT EXISTS team_db;
USE team_db;

CREATE TABLE `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `openid` VARCHAR(64) NOT NULL UNIQUE,
    `nickname` VARCHAR(50) DEFAULT '',
    `avatar` TEXT,
    `grade` VARCHAR(10) DEFAULT '',
    `major` VARCHAR(30) DEFAULT '',
    `skills` VARCHAR(255) DEFAULT '',
    `profile_completed` BOOLEAN DEFAULT FALSE,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `team_request` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` MEDIUMTEXT,
    `required_skills` VARCHAR(255) NOT NULL,
    `needed_count` INT DEFAULT 1,
    `current_count` INT DEFAULT 1,
    `contact` VARCHAR(50) NOT NULL,
    `status` VARCHAR(10) DEFAULT 'active',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);