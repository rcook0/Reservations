.PHONY: up down reset demo test-passenger check-reservations check-payments

up:
	docker-compose up --build -d

down:
	docker-compose down

reset:
	docker-compose down -v
	docker-compose up --build -d
	# give DBs time to accept connections
	sleep 8
	docker exec -i $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking < db/booking.sql
	docker exec -i $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment < db/payment.sql

demo:
	@echo ">>> Create reservation 1 (should AUTH succeed):"
	RES1=$$(curl -s -X POST http://localhost:4001/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'); \
	echo $$RES1 | jq; \
	ID1=$$(echo $$RES1 | jq -r '.reservationId'); \
	sleep 3; \
	echo "Booking R1:"; curl -s http://localhost:4001/reservations/$$ID1 | jq; \
	echo "Payment R1:"; curl -s http://localhost:4002/payments/$$ID1 | jq; \
	echo ""; \
	echo ">>> Create reservation 2 (should FAIL - even ID):"; \
	RES2=$$(curl -s -X POST http://localhost:4001/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":2,"flight_number":1001,"seat_number":"12B"}'); \
	echo $$RES2 | jq; \
	ID2=$$(echo $$RES2 | jq -r '.reservationId'); \
	sleep 3; \
	echo "Booking R2:"; curl -s http://localhost:4001/reservations/$$ID2 | jq; \
	echo "Payment R2 (expect 404):"; curl -s -w "\n" -o /dev/stdout http://localhost:4002/payments/$$ID2

test-passenger:
	curl -s -X POST http://localhost:4001/passengers \
	  -H "Content-Type: application/json" \
	  -d '{"forename":"Charlie","surname":"Brown"}' | jq

check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"
