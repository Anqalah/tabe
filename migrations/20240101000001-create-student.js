// migrations/XXXXXXX-create-students.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      jk: {
        type: Sequelize.STRING(10),
        comment: 'Jenis Kelamin'
      },
      umur: {
        type: Sequelize.STRING(3),
        comment: 'Usia siswa'
      },
      alamat: {
        type: Sequelize.TEXT,
        comment: 'Alamat lengkap'
      },
      hp: {
        type: Sequelize.STRING(15),
        comment: 'Nomor handphone'
      },
      bidang: {
        type: Sequelize.STRING(50),
        comment: 'Bidang studi'
      },
      kelas: {
        type: Sequelize.STRING(20),
        comment: 'Kelas siswa'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'student'
      },
      foto: {
        type: Sequelize.TEXT,
        comment: 'URL foto siswa'
      },
      face_embedding: {
        type: Sequelize.TEXT,
        comment: 'Face encoding dari ML'
      },
      teacherId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('students', ['email'], { unique: true });
    await queryInterface.addIndex('students', ['teacherId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('students');
  }
};