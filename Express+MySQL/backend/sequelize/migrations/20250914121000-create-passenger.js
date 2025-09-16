'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('passenger', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      forename: Sequelize.STRING(12),
      surname: Sequelize.STRING(12)
    });
  },
  async down (queryInterface) {
    await queryInterface.dropTable('passenger');
  }
};
