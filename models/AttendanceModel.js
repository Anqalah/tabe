import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Students from "./StudentModel.js";

const { DataTypes } = Sequelize;
const Attendances = db.define(
  "attendances",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    clockIn: {
      type: DataTypes.DATE,
    },
    clockOut: {
      type: DataTypes.DATE,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    locationClockIn: {
      type: DataTypes.STRING,
    },
    locationClockOut: {
      type: DataTypes.STRING,
    },
    facePhotoClockIn: {
      type: DataTypes.STRING,
    },
    facePhotoClockOut: {
      type: DataTypes.STRING,
    },
  },
  { freezeTableName: true }
);

Students.hasMany(Attendances);
Attendances.belongsTo(Students);

export default Attendances;
