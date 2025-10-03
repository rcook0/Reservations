CREATE TABLE IF NOT EXISTS reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  flight_number INT NOT NULL,
  seat_number VARCHAR(3) NOT NULL,
  status ENUM('PENDING','CONFIRMED','FAILED') DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS passenger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  forename VARCHAR(50),
  surname VARCHAR(50)
);

-- Seed two demo passengers
INSERT INTO passenger (forename, surname) VALUES ('Alice','Smith'),('Bob','Johnson');
