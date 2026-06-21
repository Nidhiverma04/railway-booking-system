-- Run this after schema.sql to load the CSV data
-- Usage: mysql -u root -p railways < loader_fixed.sql

USE railways;

-- Load stations (has header row)
LOAD DATA LOCAL INFILE 'sql/dataset/station_data.csv'
INTO TABLE stations
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(station_name, station_code);

-- Load trains (has header row: train_id,train_number,train_name,train_type)
LOAD DATA LOCAL INFILE 'sql/dataset/train_data.csv'
INTO TABLE trains
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(train_id, train_number, train_name, train_type);

-- Load train stops (has header: train_id,station_id,arrival_time,departure_time,stop_order)
LOAD DATA LOCAL INFILE 'sql/dataset/train_stops_data.csv'
INTO TABLE train_stops
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(train_id, station_id, arrival_time, departure_time, stop_order);

-- Add performance indexes AFTER loading data (much faster)
ALTER TABLE train_stops ADD INDEX idx_train_stop_order (train_id, stop_order);
ALTER TABLE train_stops ADD INDEX idx_station (station_id);
ALTER TABLE stations    ADD INDEX idx_station_name (station_name);
ALTER TABLE stations    ADD INDEX idx_station_code (station_code);
ALTER TABLE trains      ADD INDEX idx_train_number (train_number);
