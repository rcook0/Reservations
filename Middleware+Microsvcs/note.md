Option 3: Microservices + Event-Driven Middleware for your Airline Reservation System. I’ll keep it concise but concrete, with files and code you can drop into services.

High-level architecture
[API Gateway]  ->  [Auth]  ->  routes to services
        | 
        v
+-------------------+       +----------------+       +----------------+
| Airline Service   |<----->| Flight Service |<----->| Booking Service|
| (airlines,ports)  |       | (flights,deps) |       | (seats,reserv.)|
+-------------------+       +----------------+       +----------------+
          \                      /      \                      /
           \                    /        \                    /
            \                  v          \                  v
             \---------->   [Event Bus]    \------->   [Payment Service]
                              (Kafka/NATS)
    • DB per service (MariaDB/MySQL), no cross-service joins.
    • Async events for cross-service consistency.
    • Sagas orchestrate long-running flows (reserve seat ↔ take payment ↔ confirm).
    • Outbox pattern in each service to publish events atomically with local state.

Services & data ownership
Service
Owns (tables)
Publishes
Subscribes
Airline
airline(code,name), airport(code,...)
AirlineUpdated
—
Flight
flight, departure, stop
FlightScheduled, SeatMapGenerated
AirlineUpdated
Fare
fare, season, rule
FareUpdated
—
Booking
seat, reservation
SeatTentativelyHeld, SeatHeld, SeatReleased, ReservationConfirmed, ReservationFailed
FlightScheduled, FareUpdated, PaymentAuthorized, PaymentFailed
Payment
payment
PaymentAuthorized, PaymentFailed, RefundIssued
HoldSeatRequest (or ReservationInitiated)
Notification (optional)
—
emails/SMS
reservation/payment events
You can start with Airline, Flight, Booking, Payment and add Fare/Notification later.

Core saga: book a seat (Reserve → Pay → Confirm)
sequenceDiagram
  participant API as API Gateway
  participant B as Booking Svc
  participant P as Payment Svc
  participant EB as Event Bus

  API->>B: POST /reservations (passenger, flight, date, seat)
  B->>B: Tx: upsert reservation(pending), seat tentative hold
  B->>EB: emit ReservationInitiated
  EB->>P: PaymentAuthorizeRequested
  P->>P: preauth card / crypto / wallet
  alt payment ok
    P->>EB: PaymentAuthorized
    EB->>B: PaymentAuthorized
    B->>B: Tx: seat held, reservation confirmed
    B->>EB: ReservationConfirmed, SeatHeld
  else payment failed
    P->>EB: PaymentFailed
    EB->>B: PaymentFailed
    B->>B: Tx: release seat, reservation failed
    B->>EB: ReservationFailed, SeatReleased
  end
Compensation: on PaymentFailed or timeouts, Booking releases the seat and marks reservation failed.

Event design (topics & payloads)
Topics (Kafka):
    • airline.events, flight.events, booking.commands, booking.events, payment.commands, payment.events.
Booking → Payment command
// Topic: payment.commands, type: PaymentAuthorizeRequested v1
{
  "type": "PaymentAuthorizeRequested",
  "version": 1,
  "correlationId": "b9d1-...",
  "reservationId": 12345,
  "amount": 450.00,
  "currency": "EUR",
  "paymentMethod": { "kind": "card", "token": "tok_..." },
  "metadata": { "passengerId": 3, "flightNumber": 3003, "airline": "AA" }
}
Payment → Booking events
// payment.events
{ "type":"PaymentAuthorized","version":1,"reservationId":12345,"authId":"pa_789","correlationId":"b9d1-..." }
{ "type":"PaymentFailed","version":1,"reservationId":12345,"reason":"insufficient_funds","correlationId":"b9d1-..." }
Booking events
{ "type":"SeatHeld","version":1,"reservationId":12345,"seatId":987,"flightNumber":3003 }
{ "type":"SeatReleased","version":1,"reservationId":12345,"seatId":987,"reason":"payment_failed" }
{ "type":"ReservationConfirmed","version":1,"reservationId":12345 }
{ "type":"ReservationFailed","version":1,"reservationId":12345,"reason":"timeout" }
Use type + version to evolve payloads safely. Avro/Schema Registry is a plus; start with JSON.
