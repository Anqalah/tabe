import express from "express";
import {
  getStudents,
  getStudentById,
  AddStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/Students.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";
const router = express.Router();

router.get("/students", verifyUser, adminOnly, getStudents);
router.get("/students/:id", verifyUser, adminOnly, getStudentById);
router.post("/students", verifyUser, adminOnly, AddStudent);
router.patch("/students/:id", verifyUser, adminOnly, updateStudent);
router.delete("/students/:id", verifyUser, adminOnly, deleteStudent);

export default router;
