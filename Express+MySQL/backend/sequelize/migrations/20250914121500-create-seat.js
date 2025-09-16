'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('seat', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      departure_date: Sequelize.DATEONLY,
      seat_number: Sequelize.STRING(3),
      vacant: { type: Sequelize.BOOLEAN, defaultValue: true },
      flight_number: {
        type: Sequelize.INTEGER,
        references: { model: 'flight', key: 'flight_number' }
      }
    });
  },
  async down (queryInterface) {
    await queryInterface.dropTable('seat');
  }
};
