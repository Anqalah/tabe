import argon2 from "argon2";
import Admins from "../models/AdminModel.js";

export const getAdmins = async (req, res) => {
  try {
    const response = await Admins.findAll({
      attributes: ["uuid", "name", "hp", "email", "role"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const response = await Admins.findOne({
      attributes: ["uuid", "name", "email", "hp", "role"],
      where: { uuid: req.params.id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAdmin = async (req, res) => {
  const { name, email, password, confPassword, hp } = req.body;

  // 1. Validasi input lebih ketat
  if (!name || !email || !password || !confPassword || !hp) {
    return res.status(400).json({
      status: "error",
      message: "Semua field harus diisi",
    });
  }

  if (password !== confPassword) {
    return res.status(400).json({
      status: "error",
      message: "Password dan konfirmasi password tidak sama",
    });
  }

  try {
    // 2. Cek apakah email sudah terdaftar
    const existingAdmin = await Admins.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    // 3. Hash password
    const hashPassword = await argon2.hash(password);

    // 4. Timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000); // Timeout 10 detik
    });

    const createAdminPromise = Admins.create({
      name,
      email,
      hp,
      password: hashPassword,
      role: "Admin",
    });

    // 5. Gunakan Promise.race untuk handle timeout
    await Promise.race([createAdminPromise, timeoutPromise]);

    res.status(201).json({
      status: "success",
      message: "Admin berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating admin:", error);

    // 6. Handle error khusus
    if (error.message === "Request timeout") {
      return res.status(504).json({
        status: "error",
        code: 504,
        message: "Server timeout, silakan coba lagi",
      });
    }

    res.status(500).json({
      status: "error",
      code: 500,
      message: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateAdmin = async (req, res) => {
  const user = await Admins.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  const { name, email, password, confPassword, hp } = req.body;
  let hashPassword;
  if (password === "" || password === null) {
    hashPassword = user.password;
  } else {
    hashPassword = await argon2.hash(password);
  }
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password dan Confirm Password Harus Sama" });
  try {
    await Admins.update(
      {
        name: name,
        email: email,
        hp: hp,
        password: hashPassword,
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
  const user = await Admins.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  try {
    await Admins.destroy({ where: { id: user.id } });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
