import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const db = new Sequelize("tugasakhir", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// const db = new Sequelize({
//   dialect: "mysql",
//   host: process.env.MYSQLHOST,
//   port: process.env.MYSQLPORT,
//   username: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
// });

export default db;
