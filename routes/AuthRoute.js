import express from "express";
import {
  Login,
  Logout,
  Me,
  registerInitial,
  registerComplete,
  deleteRegister,
} from "../controllers/Auth.js";
const router = express.Router();

// User Authentication Routes
router.get("/me", Me);
router.post("/login", Login);
router.delete("/logout", Logout);

// Registration Routes
router.post("/register", registerInitial);
router.post("/register/complete", registerComplete);
router.delete("/register/:token", deleteRegister);

export default router;
