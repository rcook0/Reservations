# MicroservicesV3.1 – Saga with Failed Payments (Avro)

This version adds a basic **Saga** pattern:
- Booking publishes `PaymentAuthorizeRequested`.
- Payment **authorizes OR fails** (demo rule: even reservation IDs **fail**).
- On `PaymentAuthorized` → Booking sets reservation `CONFIRMED`.
- On `PaymentFailed` → Booking sets reservation `FAILED` and publishes `ReservationCancelled` for downstream services.

## Run
```bash
make reset
make demo
```
You should see:
- Reservation 1 → CONFIRMED, payment row exists.
- Reservation 2 → FAILED, no payment row, 404 on payment lookup.

## Contracts
See `/contracts` for Avro schemas, including new `reservation-cancelled.avsc`.

Next steps (V3.2+):
- API Gateway (JWT, routing, logging)
- Observability & tracing reinstated
- Schema Registry & compatibility checks
- Kubernetes manifests
