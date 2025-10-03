# MicroservicesV3.2–3.5 (Gateway, Notifications, K8s, Schema Registry)

This package advances V3 with:
- **V3.2** – API Gateway (JWT, rate limit, logging) routing to Booking/Payment
- **V3.3** – Notification service consuming `passenger.events`
- **V3.4** – Kubernetes manifests for gateway, booking, payment, notification
- **V3.5** – Schema Registry enabled on Redpanda (port 8081) and optional client usage

## Run locally
```bash
docker-compose up --build -d
# init DBs:
docker exec -i $(docker ps -qf "name=db-booking") mysql -uroot -ppassword booking < db/booking.sql
docker exec -i $(docker ps -qf "name=db-payment") mysql -uroot -ppassword payment < db/payment.sql
# create a reservation through gateway:
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({sub:'demo'}, 'devsecret'))")
curl -s -X POST http://localhost:3000/api/booking/reservations   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"   -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'
```

## Notes
- Booking/Payment use **Schema Registry** when `SCHEMA_REGISTRY_URL` is set, else fall back to local Avro.
- Redpanda is started with schema registry enabled (port `8081`) in this compose.
- Notification service logs PassengerCreated events (replace with email/SMS later).
