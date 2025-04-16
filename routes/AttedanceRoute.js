import express from "express";
import { faceUpload } from "../middleware/Multer.js"; // Sesuaikan dengan lokasi file upload
import {
  clockIn,
  clockOut,
  clockInResults,
} from "../controllers/Attedances.js";
const router = express.Router();

router.get("/attendances/clockin-result/:id", clockInResults);
router.post(
  "/attendances/clockin/:id",
  faceUpload.single("facePhotoClockIn"),
  clockIn
);
router.post(
  "/attendances/clockout/:id",
  faceUpload.single("facePhotoClockOut"),
  clockOut
);

export default router;
