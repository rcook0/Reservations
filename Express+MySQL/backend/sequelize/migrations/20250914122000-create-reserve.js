'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reserve', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      passenger_id: {
        type: Sequelize.INTEGER,
        references: { model: 'passenger', key: 'id' }
      },
      seat_id: {
        type: Sequelize.INTEGER,
        references: { model: 'seat', key: 'id' }
      }
    });
  },
  async down (queryInterface) {
    await queryInterface.dropTable('reserve');
  }
};
