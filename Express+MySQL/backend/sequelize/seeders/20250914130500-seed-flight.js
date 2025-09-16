'use strict';
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('flight', [
      { flight_number: 1001, airline_code: 'BA', aircraft: 'A320', departure_airport: 'LHR', arrival_airport: 'JFK', mileage: 5540 },
      { flight_number: 2002, airline_code: 'LH', aircraft: 'A340', departure_airport: 'FRA', arrival_airport: 'LHR', mileage: 650 },
      { flight_number: 3003, airline_code: 'AA', aircraft: 'B777', departure_airport: 'JFK', arrival_airport: 'FRA', mileage: 6200 }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('flight', null, {});
  }
};
