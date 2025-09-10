import express from "express";
import {
  checkAttendanceStatus,
  createAttendance,
  getAttendanceById,
  getAttendances,
  getHistoryAttendances,
} from "../controllers/Attedances.js";
import { attendanceUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/attendances", getAttendances);
router.get("/attendances/:id", getAttendanceById);
router.get("/attendances/history/:id", getHistoryAttendances);
router.get("/attendances/status/:uuid", checkAttendanceStatus);

router.post("/attendances", attendanceUpload.single("foto"), createAttendance);

export default router;
