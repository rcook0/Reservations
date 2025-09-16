CREATE TABLE reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  flight_number INT NOT NULL,
  seat_number VARCHAR(3) NOT NULL,
  status ENUM('PENDING','CONFIRMED','FAILED') DEFAULT 'PENDING'
);

CREATE TABLE outbox (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  payload JSON,
  published BOOLEAN DEFAULT 0
);
