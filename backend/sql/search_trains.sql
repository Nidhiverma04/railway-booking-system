-- query to find trains between two stations 

USE railways;
SELECT 
    t.train_number,
    t.train_name,
    s1.station_name AS source_station,
    s2.station_name AS destination_station,
    ts1.departure_time AS departure_from_source,
    ts2.arrival_time AS arrival_at_destination
FROM trains t

JOIN train_stops ts1 
    ON t.train_id = ts1.train_id
JOIN stations s1 
    ON ts1.station_id = s1.station_id

JOIN train_stops ts2 
    ON t.train_id = ts2.train_id
JOIN stations s2 
    ON ts2.station_id = s2.station_id

WHERE 
    s1.station_name = 'KULTI'
    AND s2.station_name = 'BARAKAR'
    AND ts1.stop_order < ts2.stop_order;

