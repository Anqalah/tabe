import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentFace,
} from "../controllers/Students.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";
import { profileUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/students", verifyUser, adminOnly, getStudents);
router.get("/students/:id", verifyUser, adminOnly, getStudentById);
router.patch(
  "/students/:id",
  verifyUser,
  adminOnly,
  profileUpload,
  updateStudent,
  updateStudentFace
);
router.delete("/students/:id", verifyUser, adminOnly, deleteStudent);

export default router;
