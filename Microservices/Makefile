.PHONY: up down logs db-init booking-db payment-db test-reservation check-reservations check-payments reset demo

# Start all services
up:
	docker-compose up --build -d

# Stop all services
down:
	docker-compose down

# Tail logs
logs:
	docker-compose logs -f

# Initialize both databases with schema
db-init: booking-db payment-db

# Load Booking schema
booking-db:
	docker exec -i $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking < db/booking.sql

# Load Payment schema
payment-db:
	docker exec -i $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment < db/payment.sql

# Send a test reservation request
test-reservation:
	curl -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'

# Check reservations in Booking DB
check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

# Check payments in Payment DB
check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"

# Reset everything: stop, remove containers & volumes, rebuild fresh
reset:
	docker-compose down -v
	docker-compose up --build -d
	$(MAKE) db-init

# Full demo: reset -> seed -> reservation -> show API JSON + DBs
demo: reset
	@echo ">>> Creating test reservation (API response):"
	RES=$$(curl -s -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'); \
	echo $$RES | jq; \
	ID=$$(echo $$RES | jq -r '.reservationId'); \
	sleep 5; \
	echo ">>> Fetching reservation via API:"; \
	curl -s http://localhost:4001/reservations/$$ID | jq; \
	echo ">>> Fetching payment via API:"; \
	curl -s http://localhost:4002/payments/$$ID | jq

