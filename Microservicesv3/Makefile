.PHONY: up down reset demo test-passenger check-reservations check-payments
up:
	docker-compose up --build -d
down:
	docker-compose down
reset:
	docker-compose down -v
	docker-compose up --build -d
	sleep 8
	docker exec -i $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking < db/booking.sql
	docker exec -i $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment < db/payment.sql
demo:
	@echo ">>> Creating reservation for Alice (passenger_id=1):"
	RES=$$(curl -s -X POST http://localhost:4001/reservations -H "Content-Type: application/json" -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}'); \
	echo $$RES | jq; \
	ID=$$(echo $$RES | jq -r '.reservationId'); \
	sleep 3; \
	echo ">>> Booking says:"; \
	curl -s http://localhost:4001/reservations/$$ID | jq; \
	echo ">>> Payment says:"; \
	curl -s http://localhost:4002/payments/$$ID | jq
test-passenger:
	curl -s -X POST http://localhost:4001/passengers -H "Content-Type: application/json" -d '{"forename":"Charlie","surname":"Brown"}' | jq
check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"
check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"
