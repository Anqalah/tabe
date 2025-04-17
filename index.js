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

const allowedOrigins = ["http://localhost:5173", "https://tafe-pi.vercel.app"];

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"],
  })
);

app.options("*", cors());

// Session configuration with proper cookie settings
app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
});

app.use(express.json());
app.use(AuthRoute);
app.use(AdminRoute);
app.use(TeacherRoute);
app.use(StudentRoute);
app.use(AttedanceRoute);

app.listen(process.env.MYSQLPORT, () => {
  console.log("Server Sedang Berjalan...");
});
