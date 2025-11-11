import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cron from "node-cron";
import { Op } from "sequelize";
import db from "./config/Database.js";
import PendingRegistration from "./models/PendingRegistration.js";
import AdminRoute from "./routes/AdminRoute.js";
import AttendanceRoute from "./routes/AttendanceRoute.js";
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
    origin: ["*"], // sesuaikan dengan origin frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(
  "*",
  cors({
    origin: ["*"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(AuthRoute);
app.use(AdminRoute);
app.use(StudentRoute);
app.use(AttendanceRoute);
app.use("/assets/attendances", express.static("assets/attendances"));
app.use("/assets/profile_images", express.static("assets/profile_images"));
app.use("/face_images", express.static("assets/face_images"));

// 🕒 Cron job pembersihan PendingRegistration setiap 1 menit
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const deleted = await PendingRegistration.destroy({
      where: {
        expires_at: { [Op.lt]: now },
      },
    });

    if (deleted > 0) {
      console.log(`🧹 ${deleted} data pending yang sudah kedaluwarsa dihapus`);
    }
  } catch (error) {
    console.error("❌ Gagal menjalankan pembersihan otomatis:", error);
  }
});

app.listen(process.env.APP_PORT, () => {
  console.log(`Server Sedang Berjalan... ${process.env.APP_PORT}`);
});
