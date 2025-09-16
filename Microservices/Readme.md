✈️ Airline Reservation – Microservices (Event-Driven Starter)
This is a starter implementation of an airline reservation system built with a microservices + event-driven architecture.
It demonstrates:
    • Service separation (Booking, Payment, Gateway)
    • MariaDB databases per service
    • Kafka (Redpanda) event bus
    • Outbox pattern for reliable event publishing
    • Reservation saga flow: PENDING → CONFIRMED

📂 Project Structure
airline-microservices-starter-v2/
 ├── docker-compose.yml
 ├── README.md
 ├── gateway/
 │    └── index.js
 ├── services/
 │    ├── booking/
 │    │    ├── index.js
 │    │    ├── outboxPublisher.js
 │    │    └── consumers/paymentEvents.js
 │    └── payment/
 │         └── index.js
 └── db/
      ├── booking.sql
      └── payment.sql

🚀 Getting Started
1. Start containers
docker-compose up --build
This spins up:
    • db-booking (MariaDB for reservations)
    • db-payment (MariaDB for payments)
    • kafka (Redpanda broker)
    • booking (Booking service, port 4001)
    • payment (Payment service, port 4002)
    • gateway (API Gateway, port 3000)

2. Initialize databases
Load schema into Booking DB:
docker exec -i $(docker ps -qf "name=db-booking") \
  mysql -uroot -ppassword booking < db/booking.sql
Load schema into Payment DB:
docker exec -i $(docker ps -qf "name=db-payment") \
  mysql -uroot -ppassword payment < db/payment.sql

3. Test Reservation Flow
Make a booking request:
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'
    • Booking inserts reservation → status = PENDING
    • Booking publishes PaymentAuthorizeRequested → Kafka
    • Payment consumes → authorizes → publishes PaymentAuthorized
    • Booking consumer picks up → updates reservation → status = CONFIRMED
Check reservations:
docker exec -it $(docker ps -qf "name=db-booking") \
  mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

🔑 Key Concepts
    • Gateway: simple proxy to the Booking API.
    • Booking Service: manages reservations, publishes events via outbox.
    • Payment Service: consumes booking events, writes payments, publishes payment results.
    • Kafka (Redpanda): event bus for inter-service communication.
    • Outbox Pattern: ensures events are only published if the transaction succeeds.

🛠️ Tech Stack
    • Node.js + Express
    • MariaDB
    • Kafka (via Redpanda container)
    • Docker Compose

📌 Next Steps
    • Add Notification service (consume ReservationConfirmed).
    • Add Fare service (validate ticket price rules).
    • Extend Booking with seat inventory checks.
    • Use Temporal or Saga orchestrator for long-running workflows.
