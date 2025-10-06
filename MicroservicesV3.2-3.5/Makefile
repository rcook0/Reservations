.PHONY: up down reset demo token check-reservations check-payments

up:
	docker-compose up --build -d

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
	curl -s -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}' | jq


token:
	@node -e "console.log(require('jsonwebtoken').sign({sub:'demo-user'}, process.env.JWT_SECRET || 'devsecret'))"



check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"

# Reset everything: stop, remove containers & volumes, rebuild fresh
reset:
	docker-compose down -v
	docker-compose up --build -d
	$(MAKE) db-init

demo:
	@TOKEN=$$(node -e "console.log(require('jsonwebtoken').sign({sub:'demo-user'}, process.env.JWT_SECRET || 'devsecret'))"); \
	echo ">>> Using JWT: $$TOKEN"; \
	echo ">>> Create reservation via Gateway:"; \
	curl -s -X POST http://localhost:3000/api/booking/reservations \
	 -H "Authorization: Bearer $$TOKEN" -H "Content-Type: application/json" \
	 -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}' | jq

# Full demo: reset -> seed -> reservation -> show API JSON + DBs
demo: reset
	@echo ">>> Creating test reservation (API response):"
	$(MAKE) test-reservation
	@sleep 5
	@echo ">>> Booking DB - reservations:"
	$(MAKE) check-reservations
	@echo ">>> Payment DB - payments:"
	$(MAKE) check-payments
