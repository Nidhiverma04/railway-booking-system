CREATE DATABASE IF NOT EXISTS railways;
USE railways;

-- TABLES
    -- Users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    station_code VARCHAR(10) UNIQUE NOT NULL
);


-- TRAINS TABLE
CREATE TABLE IF NOT EXISTS trains (
    train_id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) UNIQUE NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    train_type VARCHAR(7)
);


-- TRAIN ROUTE (TRAIN_STOPS)
CREATE TABLE IF NOT EXISTS train_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    station_id INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    stop_order INT NOT NULL, 

    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);






/*
-- Index for fast lookup skipping for now will add later when we have more data and performance issues
CREATE INDEX idx_train_number ON trains(train_number);

-- Indexes for fast search (autocomplete)
CREATE INDEX idx_station_name ON stations(station_name);
CREATE INDEX idx_station_code ON stations(station_code);

-- Indexes for fast joins & search
CREATE INDEX idx_train_stops_train ON train_stops(train_id);
CREATE INDEX idx_train_stops_station ON train_stops(station_id);
CREATE INDEX idx_train_stops_order ON train_stops(stop_order);

-- Composite index (advanced optimization)
CREATE INDEX idx_train_station ON train_stops(train_id, station_id);
*/

