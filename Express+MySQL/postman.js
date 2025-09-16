{
  "info": {
    "name": "Airline Reservation API",
    "_postman_id": "airline-reservation-sample",
    "description": "Sample Express + MySQL Airline Reservation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Airlines",
      "request": {
        "method": "GET",
        "header": [],
        "url": { "raw": "http://localhost:3000/api/airlines", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "airlines"] }
      }
    },
    {
      "name": "Get Flights",
      "request": {
        "method": "GET",
        "header": [],
        "url": { "raw": "http://localhost:3000/api/flights", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "flights"] }
      }
    },
    {
      "name": "Add Airline",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"code\": \"EK\",\n  \"name\": \"Emirates\"\n}"
        },
        "url": { "raw": "http://localhost:3000/api/airlines", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "airlines"] }
      }
    },
    {
      "name": "Add Flight",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"airline_code\": \"EK\",\n  \"flight_number\": 4004,\n  \"aircraft\": \"A380\",\n  \"departure_airport\": \"DXB\",\n  \"arrival_airport\": \"LHR\",\n  \"mileage\": 5500\n}"
        },
        "url": { "raw": "http://localhost:3000/api/flights", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "flights"] }
      }
    },
    {
      "name": "Reserve Seat (Success)",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"passenger_id\": 3,\n  \"departure_date\": \"2025-09-22\",\n  \"airline_code\": \"AA\",\n  \"flight_number\": 3003,\n  \"seat_number\": \"20A\"\n}"
        },
        "url": { "raw": "http://localhost:3000/api/reservations", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "reservations"] }
      }
    },
    {
      "name": "Reserve Seat (Fail - Double Book)",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"passenger_id\": 1,\n  \"departure_date\": \"2025-09-22\",\n  \"airline_code\": \"AA\",\n  \"flight_number\": 3003,\n  \"seat_number\": \"20A\"\n}"
        },
        "url": { "raw": "http://localhost:3000/api/reservations", "protocol": "http", "host": ["localhost"], "port": "3000", "path": ["api", "reservations"] }
      }
    }
  ]
}
