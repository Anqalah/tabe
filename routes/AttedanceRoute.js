import express from "express";
import {
  getAttendances,
  getAttendanceById,
  createAttendance,
} from "../controllers/Attedances.js";
import { attendanceUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/attendances", getAttendances);
router.get("/attendances/:id", getAttendanceById);
router.post("/attendances", attendanceUpload.single("foto"), createAttendance);

export default router;
