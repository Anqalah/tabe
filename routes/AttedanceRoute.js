import express from "express";
import { multer } from "../middleware/multer.js"; // Sesuaikan dengan lokasi file multer
import {
  clockIn,
  clockOut,
  clockInResults,
} from "../controllers/Attedances.js";
const router = express.Router();

router.get("/attendances/clockin-result/:id", clockInResults);
router.post(
  "/attendances/clockin/:id",
  multer.single("facePhotoClockIn"),
  clockIn
);
router.post(
  "/attendances/clockout/:id",
  multer.single("facePhotoClockOut"),
  clockOut
);

export default router;
