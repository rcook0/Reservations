CREATE TABLE seat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flight_number INT NOT NULL,
  departure_date DATE NOT NULL,
  seat_number VARCHAR(3) NOT NULL,
  vacant TINYINT(1) DEFAULT 1,
  UNIQUE KEY uq_flight_date_seat (flight_number, departure_date, seat_number)
);

CREATE TABLE reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  flight_number INT NOT NULL,
  departure_date DATE NOT NULL,
  seat_number VARCHAR(3) NOT NULL,
  status ENUM('PENDING','CONFIRMED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outbox (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id VARCHAR(50) NOT NULL,
  type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published TINYINT(1) DEFAULT 0,
  INDEX idx_published (published, created_at)
);

CREATE TABLE IF NOT EXISTS passenger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  forename VARCHAR(50),
  surname VARCHAR(50)
);

-- Seed passengers
INSERT INTO passenger (forename, surname) VALUES 
  ('Alice','Smith'),
  ('Bob','Johnson');
