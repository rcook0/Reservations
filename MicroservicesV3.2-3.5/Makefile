.PHONY: up down reset demo token check-reservations check-payments

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

token:
	@node -e "console.log(require('jsonwebtoken').sign({sub:'demo-user'}, process.env.JWT_SECRET || 'devsecret'))"

demo:
	@TOKEN=$$(node -e "console.log(require('jsonwebtoken').sign({sub:'demo-user'}, process.env.JWT_SECRET || 'devsecret'))"); \
	echo ">>> Using JWT: $$TOKEN"; \
	echo ">>> Create reservation via Gateway:"; \
	curl -s -X POST http://localhost:3000/api/booking/reservations \
	 -H "Authorization: Bearer $$TOKEN" -H "Content-Type: application/json" \
	 -d '{"passenger_id":1,"flight_number":1001,"seat_number":"12A"}' | jq

check-reservations:
	docker exec -it $$(docker ps -qf "name=db-booking") \
		mysql -uroot -ppassword booking -e "SELECT * FROM reservation;"

check-payments:
	docker exec -it $$(docker ps -qf "name=db-payment") \
		mysql -uroot -ppassword payment -e "SELECT * FROM payment;"
