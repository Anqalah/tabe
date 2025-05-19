import argon2 from "argon2";
import Admins from "../models/AdminModel.js";
import fs from "fs";

export const getAdmins = async (req, res) => {
  try {
    const response = await Admins.findAll({
      attributes: ["uuid", "name", "hp", "email", "role", "foto_profile"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const response = await Admins.findOne({
      attributes: ["uuid", "name", "email", "hp", "role", "foto_profile"],
      where: { uuid: req.params.id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAdmin = async (req, res) => {
  const { name, email, password, confPassword, hp } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password dan Confirm Password Harus Sama" });
  const hashPassword = await argon2.hash(password);
  try {
    await Admins.create({
      name: name,
      email: email,
      hp: hp,
      password: hashPassword,
      role: "Admin",
    });
    res.status(201).json({ msg: "Register Berhasil" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  const user = await Admins.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  const { name, email, password, confPassword, hp } = req.body;
  let hashPassword = user.password;

  // Jika password tidak kosong dan konfirmasi password cocok,
  if (password && password !== "") {
    if (password !== confPassword)
      return res
        .status(400)
        .json({ msg: "Password dan Confirm Password Harus Sama" });
    hashPassword = await argon2.hash(password); // Hash password baru
  }

  // Menangani foto profil jika ada
  let fotoProfile = user.foto_profile;
  if (req.file) {
    const filename = req.file.filename;
    fotoProfile = `${req.protocol}://${req.get(
      "host"
    )}/assets/profile_images/${filename}`;
  }

  try {
    await Admins.update(
      {
        name: name,
        email: email,
        hp: hp,
        password: hashPassword,
        foto_profile: fotoProfile,
      },
      {
        where: { id: user.id },
      }
    );
    res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    // 1. Cari admin berdasarkan UUID
    const admin = await Admins.findOne({
      where: { uuid: req.params.id },
    });
    // 2. Handle jika admin tidak ditemukan
    if (!admin) {
      return res.status(404).json({ msg: "Admin tidak ditemukan" });
    }
    // 3. Hapus foto profil dari storage (optional)
    if (admin.foto_profile) {
      const filename = admin.foto_profile.split("/").pop();
      const filePath = `../assets/profile_images/${filename}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Hapus file secara sync
      }
    }
    // 4. Eksekusi penghapusan data
    await Admins.destroy({
      where: { id: admin.id },
    });
    // 5. Response sukses
    res.status(200).json({ msg: "Admin berhasil dihapus" });
  } catch (error) {
    // 6. Handle error
    console.error("Delete error:", error);
    res.status(500).json({
      msg: "Terjadi kesalahan saat menghapus admin",
      error: error.message,
    });
  }
};
