import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const PendingRegistration = db.define(
  "pending_registrations",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    jk: { type: DataTypes.STRING },
    umur: { type: DataTypes.INTEGER },
    alamat: { type: DataTypes.TEXT },
    hp: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true,
        len: [10, 13],
      },
    },
    bidang: { type: DataTypes.STRING },
    kelas: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: { notEmpty: true, isDate: true },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["email", "verification_token"] }],
  }
);

export default PendingRegistration;
