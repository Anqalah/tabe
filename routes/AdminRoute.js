import express from "express";
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/Admins.js";
import { verifyUser, adminOnly } from "../middleware/AuthUsers.js";
const router = express.Router();

router.get("/admins", verifyUser, adminOnly, getAdmins);
router.get("/admins/:id", verifyUser, adminOnly, getAdminById);
router.post("/admins", verifyUser, adminOnly, createAdmin);
router.patch("/admins/:id", verifyUser, adminOnly, updateAdmin);
router.delete("/admins/:id", verifyUser, adminOnly, deleteAdmin);

export default router;
