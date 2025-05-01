import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/Database.js";
import AdminRoute from "./routes/AdminRoute.js";
import AttedanceRoute from "./routes/AttedanceRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import TeacherRoute from "./routes/TeacherRoute.js";

dotenv.config();

const app = express();
await db.authenticate();
// await sessionStore.drop();
// await PendingRegistration.sync({ force: true });
// await PendingRegistration.sync();

app.use(
  cors({
    origin: "http://localhost:5173", // sesuaikan dengan origin frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
