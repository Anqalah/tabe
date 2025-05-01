import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/Teachers.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";
const router = express.Router();

router.get("/teachers", verifyUser, adminOnly, getTeachers);
router.get("/teachers/:id", verifyUser, adminOnly, getTeacherById);
router.post("/teachers", verifyUser, adminOnly, createTeacher);
router.patch("/teachers/:id", verifyUser, adminOnly, updateTeacher);
router.delete("/teachers/:id", verifyUser, adminOnly, deleteTeacher);

export default router;
