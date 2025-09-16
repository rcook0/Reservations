'use strict';
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('seat', [
      { departure_date: '2025-09-20', seat_number: '1A', flight_number: 1001, vacant: true },
      { departure_date: '2025-09-20', seat_number: '1B', flight_number: 1001, vacant: true },
      { departure_date: '2025-09-21', seat_number: '10A', flight_number: 2002, vacant: true },
      { departure_date: '2025-09-22', seat_number: '20A', flight_number: 3003, vacant: true }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('seat', null, {});
  }
};
