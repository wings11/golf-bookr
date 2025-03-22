CREATE DATABASE IF NOT EXISTS golf_bookr;
USE golf_bookr;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'user',
    UNIQUE KEY unique_username (username),
    UNIQUE KEY unique_email (email)
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    holes INT NOT NULL
);

CREATE TABLE tee_times (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    tee_time_id INT,
    players INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id)
);

