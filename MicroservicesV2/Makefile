.PHONY: up down logs db-init booking-db payment-db test-reservation check-reservations check-payments reset demo metrics

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

db-init: booking-db payment-db

booking-db:
	docker exec -i $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking < db/booking.sql

payment-db:
	docker exec -i $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment < db/payment.sql

test-reservation:
	curl -s -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}' | jq

check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"

reset:
	docker-compose down -v
	docker-compose up --build -d
	$(MAKE) db-init

demo: reset
	@echo ">>> Creating first reservation (12A):"
	RES1=$$(curl -s -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'); \
	echo $$RES1 | jq; \
	ID1=$$(echo $$RES1 | jq -r '.reservationId'); \
	sleep 3; \
	echo ">>> Reservation 1 via API:"; \
	curl -s http://localhost:4001/reservations/$$ID1 | jq; \
	echo ">>> Payment 1 via API:"; \
	curl -s http://localhost:4002/payments/$$ID1 | jq; \
	echo ""; \
	echo ">>> Creating second reservation (12B):"; \
	RES2=$$(curl -s -X POST http://localhost:3000/api/reservations \
	  -H "Content-Type: application/json" \
	  -d '{"passenger_id":2,"flight_number":1001,"seat_number":"12B"}'); \
	echo $$RES2 | jq; \
	ID2=$$(echo $$RES2 | jq -r '.reservationId'); \
	sleep 3; \
	echo ">>> Reservation 2 via API:"; \
	curl -s http://localhost:4001/reservations/$$ID2 | jq; \
	echo ">>> Payment 2 via API:"; \
	curl -s http://localhost:4002/payments/$$ID2 | jq

metrics:
	@echo ">>> Booking service metrics:"
	curl -s http://localhost:4001/metrics | head -20
	@echo ""
	@echo ">>> Payment service metrics:"
	curl -s http://localhost:4002/metrics | head -20
