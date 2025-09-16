.PHONY: up down logs db-init booking-db payment-db

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
