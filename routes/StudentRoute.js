import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/Students.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";
import { studentUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/students", verifyUser, adminOnly, getStudents);
router.get("/students/:id", verifyUser, adminOnly, getStudentById);
router.patch(
  "/students/:id",
  verifyUser,
  adminOnly,
  studentUpload,
  updateStudent
);
router.delete("/students/:id", verifyUser, adminOnly, deleteStudent);

export default router;
