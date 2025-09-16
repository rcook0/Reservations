# Airline Reservation Sample App (MySQL/MariaDB)

## Setup

1. Ensure you have MySQL/MariaDB running and create a database:

```sql
CREATE DATABASE airline_db;
```

2. Apply schema (simplified from full design):

```sql
CREATE TABLE airline (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE flight (
  airline_code CHAR(2),
  flight_number INT PRIMARY KEY,
  aircraft VARCHAR(20),
  departure_airport CHAR(3),
  arrival_airport CHAR(3),
  mileage INT,
  FOREIGN KEY (airline_code) REFERENCES airline(code) ON DELETE CASCADE
);

CREATE TABLE seat (
  departure_date DATE,
  airline_code CHAR(2),
  flight_number INT,
  seat_number CHAR(3),
  vacant ENUM('Y','N') DEFAULT 'Y',
  PRIMARY KEY (departure_date, airline_code, flight_number, seat_number)
);

CREATE TABLE passenger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  forename VARCHAR(12),
  surname VARCHAR(12)
);

CREATE TABLE reserves (
  passenger_id INT,
  departure_date DATE,
  airline_code CHAR(2),
  flight_number INT,
  seat_number CHAR(3),
  PRIMARY KEY (passenger_id, departure_date, airline_code, flight_number, seat_number),
  FOREIGN KEY (passenger_id) REFERENCES passenger(id),
  FOREIGN KEY (airline_code) REFERENCES airline(code)
);
```

3. Install dependencies and run the app:

```bash
npm install
npm start
```

The server runs at `http://localhost:3000`.

- `GET /api/airlines`
- `POST /api/airlines`
- `GET /api/flights`
- `POST /api/flights`
- `POST /api/reservations`
