'use strict';
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('airline', [
      { code: 'BA', name: 'British Airways' },
      { code: 'LH', name: 'Lufthansa' },
      { code: 'AA', name: 'American Airlines' }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('airline', null, {});
  }
};
