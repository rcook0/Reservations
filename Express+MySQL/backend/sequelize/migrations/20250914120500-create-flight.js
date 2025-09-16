'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('flight', {
      flight_number: { type: Sequelize.INTEGER, primaryKey: true },
      airline_code: {
        type: Sequelize.STRING(2),
        references: { model: 'airline', key: 'code' }
      },
      aircraft: Sequelize.STRING(20),
      departure_airport: Sequelize.STRING(3),
      arrival_airport: Sequelize.STRING(3),
      mileage: Sequelize.INTEGER
    });
  },
  async down (queryInterface) {
    await queryInterface.dropTable('flight');
  }
};
