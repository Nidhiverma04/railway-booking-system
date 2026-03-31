CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100),
    station_code VARCHAR(10) UNIQUE
);

