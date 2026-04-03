-- Run these two lines first to select the database and enable local file loading
USE railways;
SET GLOBAL local_infile = 1;


-- user data 
INSERT INTO users (name, email, password)
VALUES
('Prashant Yadav', 'prashant@example.com', '6377244020'),
('Nidhi Verma', 'nidhi@example.com', '7347405662'),
('Pratham Mahajan', 'pratham@example.com', '1234567890'),
('Mukul Bhardwaj', 'mukul@example.com', '9876543210');
--SELECT * FROM users;



-- Change the file paths according to your system
-- Load data into the 'stations' table from a CSV file
LOAD DATA LOCAL INFILE "C:\\Users\\HP\\Desktop\\Railways\\railway-booking-system\\backend\\sql\\dataset\\station_data.csv"
INTO TABLE stations
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(station_name, station_code);
--SELECT * FROM stations; 


-- Load data into train table
LOAD DATA LOCAL INFILE "C:\\Users\\HP\\Desktop\\Railways\\railway-booking-system\\backend\\sql\\dataset\\train_data.csv"
INTO TABLE trains
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(train_number, train_name);
--SELECT * FROM trains;


-- Load data into train stopes table
LOAD DATA LOCAL INFILE "C://Users//HP//Desktop//Railways//railway-booking-system//backend//sql//dataset//train_stops_data.csv"
INTO TABLE train_stops
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(train_id, station_id, arrival_time, departure_time, stop_order);
--select * from train_stops;


