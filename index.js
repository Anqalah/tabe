import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/Database.js";
import AdminRoute from "./routes/AdminRoute.js";
import AttedanceRoute from "./routes/AttedanceRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";

dotenv.config();

const app = express();
await db.authenticate();
// await Attendances.drop();
// await Attendances.sync({ force: true });
// await Attendances.sync();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://tafe-pi.vercel.app"], // sesuaikan dengan origin frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://tafe-pi.vercel.app,"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(AuthRoute);
app.use(AdminRoute);
app.use(StudentRoute);
app.use(AttedanceRoute);
app.use("/assets/attendances", express.static("assets/attendances"));
app.use("/assets/profile_images", express.static("assets/profile_images"));
app.use("/face_images", express.static("assets/face_images"));

// app.listen(process.env.APP_PORT, () => {
//   console.log(`Server Sedang Berjalan... ${process.env.APP_PORT}`);
// });

app.listen(process.env.PGPORT, () => {
  console.log(`Server Sedang Berjalan... ${process.env.PGPORT}`);
});
