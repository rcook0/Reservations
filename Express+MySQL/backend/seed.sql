-- Original seed.sql

-- docker exec -i <container_name> mysql -uroot -ppassword airline_db < backend/seed.sql

-- Airlines
INSERT INTO airline (code, name) VALUES
('BA', 'British Airways'),
('LH', 'Lufthansa'),
('AA', 'American Airlines');

-- Flights
INSERT INTO flight (flight_number, airline_code, aircraft, departure_airport, arrival_airport, mileage) VALUES
(1001, 'BA', 'A320', 'LHR', 'JFK', 5540),
(2002, 'LH', 'A340', 'FRA', 'LHR', 650),
(3003, 'AA', 'B777', 'JFK', 'FRA', 6200);

-- Passengers
INSERT INTO passenger (id, forename, surname) VALUES
(1, 'Alice', 'Smith'),
(2, 'Bob', 'Johnson'),
(3, 'Charlie', 'Williams');

-- Seats
INSERT INTO seat (id, departure_date, seat_number, flight_number, vacant) VALUES
(1, '2025-09-20', '1A', 1001, 1),
(2, '2025-09-20', '1B', 1001, 1),
(3, '2025-09-21', '10A', 2002, 1),
(4, '2025-09-22', '20A', 3003, 1);

-- Reservation (Bob reserves BA1001 seat 1A)
INSERT INTO reserve (id, passenger_id, seat_id) VALUES
(1, 2, 1);
