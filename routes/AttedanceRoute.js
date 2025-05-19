import express from "express";
import {
  getAttendances,
  getAttendanceById,
  createAttendance,
  getFastestAttendance,
} from "../controllers/Attedances.js";
import { attendanceUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/attendances", getAttendances);
router.get("/attendances/:id", getAttendanceById);
router.get("/attendances/fastest", getFastestAttendance);
router.post("/attendances", attendanceUpload.single("foto"), createAttendance);

export default router;
