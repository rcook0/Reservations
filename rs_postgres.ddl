CREATE TABLE Airline(
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Airport(
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(50),
    city VARCHAR(50),
    country VARCHAR(50)
);

CREATE TABLE Fare(
    basis_code VARCHAR(6) PRIMARY KEY,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    basis_class CHAR(1),
    single INTEGER,
    return INTEGER,
    carriage_class VARCHAR(20),
    name VARCHAR(50) DEFAULT 'FARE',
    currency CHAR(3) DEFAULT 'USD'
);

CREATE TABLE Flight(
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    flight_number INTEGER PRIMARY KEY,
    aircraft VARCHAR(20),
    departure_airport CHAR(3),
    departure_time TIME,
    arrival_airport CHAR(3),
    arrival_time TIME,
    mileage INTEGER,
    smoking CHAR(1) DEFAULT 'N' CHECK (smoking IN ('Y','N'))
);

CREATE TABLE Departure(
    date DATE PRIMARY KEY,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    flight_number INTEGER REFERENCES Flight(flight_number) ON DELETE CASCADE ON UPDATE CASCADE,
    time TIME,
    aircraft VARCHAR(20)
);

CREATE TABLE Seat(
    departure_date DATE,
    airline_code CHAR(2),
    flight_number INTEGER,
    seat_number CHAR(3) PRIMARY KEY,
    basis_code VARCHAR(6),
    for_sale CHAR(1) CHECK (for_sale IN ('Y','N')),
    vacant CHAR(1) CHECK (vacant IN ('Y','N')),
    FOREIGN KEY (departure_date, airline_code, flight_number)
        REFERENCES Departure(date, airline_code, flight_number) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Passenger(
    id SERIAL PRIMARY KEY,
    forename VARCHAR(12),
    surname VARCHAR(12)
);

CREATE TABLE Stops(
    flight_number INTEGER REFERENCES Flight(flight_number) ON DELETE CASCADE ON UPDATE CASCADE,
    airport_code CHAR(3) REFERENCES Airport(code) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Reserves(
    passenger_id INTEGER REFERENCES Passenger(id) ON DELETE SET NULL ON UPDATE CASCADE,
    departure_date DATE,CREATE TABLE Airline(
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Airport(
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(50),
    city VARCHAR(50),
    country VARCHAR(50)
);

CREATE TABLE Fare(
    basis_code VARCHAR(6) PRIMARY KEY,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    basis_class CHAR(1),
    single INTEGER,
    return INTEGER,
    carriage_class VARCHAR(20),
    name VARCHAR(50) DEFAULT 'FARE',
    currency CHAR(3) DEFAULT 'USD'
);

CREATE TABLE Flight(
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    flight_number INTEGER PRIMARY KEY,
    aircraft VARCHAR(20),
    departure_airport CHAR(3),
    departure_time TIME,
    arrival_airport CHAR(3),
    arrival_time TIME,
    mileage INTEGER,
    smoking CHAR(1) DEFAULT 'N' CHECK (smoking IN ('Y','N'))
);

CREATE TABLE Departure(
    date DATE PRIMARY KEY,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    flight_number INTEGER REFERENCES Flight(flight_number) ON DELETE CASCADE ON UPDATE CASCADE,
    time TIME,
    aircraft VARCHAR(20)
);

CREATE TABLE Seat(
    departure_date DATE,
    airline_code CHAR(2),
    flight_number INTEGER,
    seat_number CHAR(3) PRIMARY KEY,
    basis_code VARCHAR(6),
    for_sale CHAR(1) CHECK (for_sale IN ('Y','N')),
    vacant CHAR(1) CHECK (vacant IN ('Y','N')),
    FOREIGN KEY (departure_date, airline_code, flight_number)
        REFERENCES Departure(date, airline_code, flight_number) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Passenger(
    id SERIAL PRIMARY KEY,
    forename VARCHAR(12),
    surname VARCHAR(12)
);

CREATE TABLE Stops(
    flight_number INTEGER REFERENCES Flight(flight_number) ON DELETE CASCADE ON UPDATE CASCADE,
    airport_code CHAR(3) REFERENCES Airport(code) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Reserves(
    passenger_id INTEGER REFERENCES Passenger(id) ON DELETE SET NULL ON UPDATE CASCADE,
    departure_date DATE,
    airline_code CHAR(2),
    flight_number INTEGER,
    seat_number CHAR(3),
    FOREIGN KEY (departure_date, airline_code, flight_number, seat_number)
        REFERENCES Seat(departure_date, airline_code, flight_number, seat_number) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Season(
    code SERIAL PRIMARY KEY,
    start DATE,
    end DATE
);

CREATE TABLE Offered(
    basis_code VARCHAR(6) REFERENCES Fare(basis_code) ON DELETE CASCADE ON UPDATE CASCADE,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    season_code INTEGER REFERENCES Season(code) ON DELETE CASCADE ON UPDATE CASCADE
);

    airline_code CHAR(2),
    flight_number INTEGER,
    seat_number CHAR(3),
    FOREIGN KEY (departure_date, airline_code, flight_number, seat_number)
        REFERENCES Seat(departure_date, airline_code, flight_number, seat_number) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Season(
    code SERIAL PRIMARY KEY,
    start DATE,
    end DATE
);

CREATE TABLE Offered(
    basis_code VARCHAR(6) REFERENCES Fare(basis_code) ON DELETE CASCADE ON UPDATE CASCADE,
    airline_code CHAR(2) REFERENCES Airline(code) ON DELETE CASCADE ON UPDATE CASCADE,
    season_code INTEGER REFERENCES Season(code) ON DELETE CASCADE ON UPDATE CASCADE
);
