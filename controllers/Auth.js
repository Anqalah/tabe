import argon2 from "argon2";
import Admins from "../models/AdminModel.js";
import Students from "../models/StudentModel.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { faceUpload } from "../middleware/Multer.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import FormData from "form-data";
import axios from "axios";

const findUserByEmail = async (email) => {
  return (
    (await Admins.findOne({ where: { email } })) ||
    (await Students.findOne({ where: { email } }))
  );
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Email dan password harus diisi" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: "Email atau password salah" });
    }
    const match = await argon2.verify(user.password, password);
    if (!match) {
      return res.status(400).json({ msg: "Email atau password salah" });
    }
    const token = jwt.sign(
      { uuid: user.uuid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      msg: "Login berhasil",
      token,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const Me = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Mohon login terlebih dahulu" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user =
      (await Admins.findOne({
        attributes: [
          "id",
          "uuid",
          "name",
          "email",
          "role",
          "foto_profile",
          "hp",
        ],
        where: { uuid: decoded.uuid },
      })) ||
      (await Students.findOne({
        attributes: [
          "id",
          "uuid",
          "name",
          "email",
          "role",
          "foto_profile",
          "hp",
        ],
        where: { uuid: decoded.uuid },
      }));
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.status(200).json(user);
  } catch (err) {
    return res.status(403).json({ msg: "Token tidak valid atau kadaluarsa" });
  }
};

export const Logout = (req, res) => {
  res
    .status(200)
    .json({ msg: "Logout berhasil. Silakan hapus token di client." });
};

export const registerInitial = async (req, res) => {
  const { name, email, alamat, jk, hp, bidang, kelas, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ msg: "Semua field wajib diisi" });

  const existing = await Students.findOne({ where: { email } });
  if (existing) return res.status(409).json({ msg: "Email sudah terdaftar" });

  const hashPassword = await argon2.hash(password);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  try {
    const pendingUser = await PendingRegistration.create({
      name,
      email,
      hp,
      password: hashPassword,
      verification_token: verificationToken,
      expires_at: expiresAt,
    });

    res.status(201).json({
      msg: "Pendaftaran tahap awal berhasil",
      verification_token: verificationToken,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("Error saat registrasi awal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register Tahap Akhir dengan upload wajah
export const registerComplete = [
  faceUpload.single("face_image"),
  async (req, res) => {
    try {
      const { verification_token } = req.body;

      if (!verification_token || !req.file) {
        if (req.file) {
          try {
            await fs.promises.unlink(req.file.path);
          } catch (err) {
            console.error("Gagal menghapus file:", err);
          }
        }
        return res.status(400).json({ error: "Data tidak lengkap" });
      }

      const pending = await PendingRegistration.findOne({
        where: { verification_token },
      });

      if (!pending || new Date() > pending.expires_at) {
        if (req.file) {
          try {
            await fs.promises.unlink(req.file.path);
          } catch (err) {
            console.error("Gagal menghapus file:", err);
          }
        }
        return res
          .status(400)
          .json({ error: "Token tidak valid atau sudah kedaluwarsa" });
      }

      const faceImagePath = `${req.protocol}://${req.get(
        "host"
      )}/face_images/${path.basename(req.file.path)}`;

      // Buat akun baru di DB
      const newStudent = await Students.create({
        ...pending.dataValues,
        face_image: faceImagePath,
        role: "Student",
      });

      // Hapus pending registration
      await pending.destroy();

      // --- Kirim ke FastAPI untuk enroll wajah ---
      let embeddingResult = null;
      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);

        const formData = new FormData();
        // ⚠️ PENTING: gunakan uuid sebagai studentId konsisten di semua layanan
        formData.append("studentId", newStudent.uuid);
        formData.append("file", fileBuffer, {
          filename: path.basename(req.file.path),
          contentType: req.file.mimetype,
        });

        const fastApiRes = await axios.post(
          "http://localhost:5000/enroll",
          formData,
          { headers: formData.getHeaders() }
        );

        console.log("[REGISTRATION] Enroll response:", fastApiRes.data);
        embeddingResult = fastApiRes.data;
      } catch (err) {
        console.error("[FASTAPI] Gagal mengirim ke /enroll:", err.message);
      }

      // Hapus file lokal setelah selesai
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.warn("Gagal hapus file lokal:", err.message);
      }

      // --- Kirim respons sukses ke frontend + embeddingResult ---
      res.json({
        success: true,
        data: {
          id: newStudent.id,
          uuid: newStudent.uuid,
          name: newStudent.name,
          email: newStudent.email,
          face_image: faceImagePath,
        },
        embeddingResult, // 👉 ini yang nanti dibaca React
      });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Register complete error:", error);
      res.status(500).json({
        error: "Gagal menyelesaikan registrasi",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

export const deleteRegister = async (req, res) => {
  try {
    const { token } = req.params;
    await PendingRegistration.destroy({ where: { verification_token: token } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus data pending" });
  }
};
