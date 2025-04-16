import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Teachers from "./TeacherModel.js";

const { DataTypes } = Sequelize;
const Students = db.define(
  "students",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    jk: DataTypes.STRING,
    umur: DataTypes.STRING,
    alamat: DataTypes.STRING,
    hp: DataTypes.STRING,
    bidang: DataTypes.STRING,
    kelas: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    foto_profile: {
      type: DataTypes.STRING,
    },
    face_image: {
      type: DataTypes.STRING,
    },
  },
  { freezeTableName: true }
);

Teachers.hasMany(Students);
Students.belongsTo(Teachers);

export default Students;
