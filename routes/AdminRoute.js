import express from "express";
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/Admins.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";
import { profileUpload } from "../middleware/Multer.js";
const router = express.Router();

router.get("/admins", verifyUser, adminOnly, getAdmins);
router.get("/admins/:id", verifyUser, adminOnly, getAdminById);
router.post("/admins", verifyUser, adminOnly, createAdmin);
router.patch("/admins/:id", verifyUser, adminOnly, profileUpload, updateAdmin);
router.delete("/admins/:id", verifyUser, adminOnly, deleteAdmin);

export default router;
