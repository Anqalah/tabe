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
    secure: "auto",
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

app.listen(process.env.APP_PORT, () => {
  console.log("Server Sedang Berjalan...");
});
