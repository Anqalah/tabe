import express from "express";
import { upload } from "../middleware/multer.js"; // Sesuaikan dengan lokasi file upload
import {
  clockIn,
  clockOut,
  clockInResults,
} from "../controllers/Attedances.js";
const router = express.Router();

router.get("/attendances/clockin-result/:id", clockInResults);
router.post(
  "/attendances/clockin/:id",
  upload.single("facePhotoClockIn"),
  clockIn
);
router.post(
  "/attendances/clockout/:id",
  upload.single("facePhotoClockOut"),
  clockOut
);

export default router;
