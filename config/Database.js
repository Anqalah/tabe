import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// const db = new Sequelize("tugasakhir", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
// });

const db = new Sequelize({
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

export default db;
