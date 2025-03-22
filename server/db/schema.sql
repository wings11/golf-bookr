-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    holes INT NOT NULL,
    location VARCHAR(255),
    facilities TEXT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
    caddie_required BOOLEAN DEFAULT false,
    golf_cart_available BOOLEAN DEFAULT true,
    club_rental_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tee times table
CREATE TABLE IF NOT EXISTS tee_times (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    max_players INT DEFAULT 4,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_tee_time (course_id, date, time)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tee_time_id INT NOT NULL,
    players INT NOT NULL DEFAULT 1,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    special_requests TEXT,
    caddie_requested BOOLEAN DEFAULT false,
    cart_requested BOOLEAN DEFAULT false,
    equipment_rental JSON,
    booking_status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id)
);

-- Add indexes for performance
CREATE INDEX idx_tee_times_date ON tee_times(date);
CREATE INDEX idx_tee_times_available ON tee_times(available);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
