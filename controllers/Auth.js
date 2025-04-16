import argon2 from "argon2";
import Admins from "../models/AdminModel.js";
import Teachers from "../models/TeacherModel.js";
import Students from "../models/StudentModel.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { faceUpload } from "../middleware/Multer.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const findUserByEmail = async (email) => {
  return (
    (await Admins.findOne({ where: { email } })) ||
    (await Teachers.findOne({ where: { email } })) ||
    (await Students.findOne({ where: { email } }))
  );
};

export const Login = async (req, res) => {
  // Validasi input
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ msg: "Email dan password harus diisi" });
  }

  const { email, password } = req.body;

  try {
    // Cari user dengan validasi email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: "Email atau password salah" });
    }

    // Verifikasi password
    const match = await argon2.verify(user.password, password);
    if (!match) {
      return res.status(400).json({ msg: "Email atau password salah" });
    }

    // Buat session
    req.session.userId = user.uuid;

    // Pastikan session tersimpan sebelum mengirim response
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ msg: "Gagal menyimpan session" });
      }

      res.status(200).json({
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    // Berikan pesan error yang lebih spesifik
    if (error.message.includes("argon2")) {
      return res.status(500).json({ msg: "Error verifikasi password" });
    }

    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const Me = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon Login Terlebih Dahulu" });
  }
  // Mencari user di tabel admins
  let user = await Admins.findOne({
    attributes: ["uuid", "name", "email", "role"],
    where: { uuid: req.session.userId },
  });
  // Mencari user di tabel teachers
  if (!user) {
    user = await Teachers.findOne({
      attributes: ["uuid", "name", "email", "role"],
      where: { uuid: req.session.userId },
    });
  }
  // Jika masih tidak ditemukan, cari di tabel students
  if (!user) {
    user = await Students.findOne({
      attributes: ["uuid", "name", "email", "role"],
      where: { uuid: req.session.userId },
    });
  }
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  res.status(200).json(user);
};

export const Logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak Dapat Logout" });
    res.status(200).json({ msg: "Logout Berhasil" });
  });
};

// Register Tahap Awal
export const registerInitial = async (req, res) => {
  try {
    const {
      password,
      confPassword,
      email,
      alamat,
      name,
      jk,
      umur,
      hp,
      bidang,
      kelas,
    } = req.body;

    if (!password || !confPassword || !email || !alamat || !name) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    if (password !== confPassword) {
      return res.status(400).json({ error: "Password tidak cocok" });
    }

    if (await Students.findOne({ where: { email } })) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    const hashPassword = await argon2.hash(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    const pendingUser = await PendingRegistration.create({
      name,
      email,
      alamat,
      jk,
      umur,
      hp,
      bidang,
      kelas,
      password: hashPassword,
      verification_token: verificationToken,
      expires_at: expiresAt,
    });

    res.json({
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
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Data tidak lengkap" });
      }

      const pending = await PendingRegistration.findOne({
        where: { verification_token },
      });

      if (!pending || new Date() > pending.expires_at) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ error: "Token tidak valid atau sudah kedaluwarsa" });
      }

      const faceImagePath = path.relative("assets", req.file.path); // relative ke folder static

      const newStudent = await Students.create({
        ...pending.dataValues,
        face_image: faceImagePath,
        role: "Student",
      });

      await pending.destroy();

      res.json({
        success: true,
        data: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          face_image_url: `/face_images/${path.basename(req.file.path)}`,
        },
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
