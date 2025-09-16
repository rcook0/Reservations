'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('airline', {
      code: { type: Sequelize.STRING(2), primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false }
    });
  },
  async down (queryInterface) {
    await queryInterface.dropTable('airline');
  }
};
