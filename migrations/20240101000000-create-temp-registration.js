// migrations/XXXXXXX-create-pending-registrations.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pending_registrations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      jk: Sequelize.STRING(10),
      umur: Sequelize.STRING(3),
      alamat: Sequelize.TEXT,
      hp: Sequelize.STRING(15),
      bidang: Sequelize.STRING(50),
      kelas: Sequelize.STRING(20),
      password: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('pending_registrations', ['token'], { unique: true });
    await queryInterface.addIndex('pending_registrations', ['email']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pending_registrations');
  }
};