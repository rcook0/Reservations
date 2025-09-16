import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.airline.createMany({
    data: [
      { code: 'BA', name: 'British Airways' },
      { code: 'LH', name: 'Lufthansa' },
      { code: 'AA', name: 'American Airlines' }
    ]
  });

  await prisma.flight.createMany({
    data: [
      { flight_number: 1001, airline_code: 'BA', aircraft: 'A320', departure_airport: 'LHR', arrival_airport: 'JFK', mileage: 5540 },
      { flight_number: 2002, airline_code: 'LH', aircraft: 'A340', departure_airport: 'FRA', arrival_airport: 'LHR', mileage: 650 },
      { flight_number: 3003, airline_code: 'AA', aircraft: 'B777', departure_airport: 'JFK', arrival_airport: 'FRA', mileage: 6200 }
    ]
  });

  await prisma.passenger.createMany({
    data: [
      { forename: 'Alice', surname: 'Smith' },
      { forename: 'Bob', surname: 'Johnson' },
      { forename: 'Charlie', surname: 'Williams' }
    ]
  });

  await prisma.seat.createMany({
    data: [
      { departure_date: new Date('2025-09-20'), seat_number: '1A', flight_number: 1001 },
      { departure_date: new Date('2025-09-20'), seat_number: '1B', flight_number: 1001 },
      { departure_date: new Date('2025-09-21'), seat_number: '10A', flight_number: 2002 },
      { departure_date: new Date('2025-09-22'), seat_number: '20A', flight_number: 3003 }
    ]
  });

  await prisma.reserve.create({
    data: { passenger_id: 2, seat_id: 1 } // Bob reserves BA1001 seat 1A
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
                        
