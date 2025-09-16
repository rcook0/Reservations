'use strict';
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('reserve', [
      { passenger_id: 2, seat_id: 1 } // Bob reserves BA1001 seat 1A
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('reserve', null, {});
  }
};
