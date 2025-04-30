import SequelizeStore from "connect-session-sequelize";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import db from "./config/Database.js";
import AdminRoute from "./routes/AdminRoute.js";
import AttedanceRoute from "./routes/AttedanceRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import TeacherRoute from "./routes/TeacherRoute.js";

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({ db: db });
await db.authenticate();
// await Attendances.drop();
// await A.sync({ force: true });
// await PendingRegistration.sync();
// store.sync();

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true di production, false di development
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none untuk production jika cross-site
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
      domain:
        process.env.NODE_ENV === "production"
          ? ".tabe.onrender.com"
          : undefined, // Sesuaikan dengan domain production
    },
    proxy: process.env.NODE_ENV === "production", // Diperlukan jika di belakang proxy seperti Render
    name: "tabe.sid", // Nama cookie khusus
  })
);

app.use(
  cors({
    origin: "http://localhost:5173", // sesuaikan dengan origin frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());
app.use(AuthRoute);
app.use(AdminRoute);
app.use(TeacherRoute);
app.use(StudentRoute);
app.use(AttedanceRoute);

app.listen(process.env.MYSQLPORT, () => {
  console.log("Server Sedang Berjalan...");
});
