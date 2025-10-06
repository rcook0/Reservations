CREATE TABLE flight (
  flight_number INT PRIMARY KEY,
  airline_code CHAR(2) NOT NULL,
  aircraft VARCHAR(20),
  departure_airport CHAR(3),
  arrival_airport CHAR(3),
  mileage INT
);
