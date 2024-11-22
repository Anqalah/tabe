import express from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/Students.js";
import { adminOnly, verifyUser } from "../middleware/AuthUsers.js";
const router = express.Router();

router.get("/students", verifyUser, getStudents);
router.get("/students/:id", verifyUser, adminOnly, getStudentById);
router.post("/students", verifyUser, adminOnly, createStudent);
router.patch("/students/:id", verifyUser, adminOnly, updateStudent);
router.delete("/students/:id", verifyUser, adminOnly, deleteStudent);

export default router;
