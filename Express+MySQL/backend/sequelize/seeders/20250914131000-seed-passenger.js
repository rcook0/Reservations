'use strict';
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('passenger', [
      { forename: 'Alice', surname: 'Smith' },
      { forename: 'Bob', surname: 'Johnson' },
      { forename: 'Charlie', surname: 'Williams' }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('passenger', null, {});
  }
};
