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
      attributes: [
        "uuid",
        "name",
        "email",
        "hp",
        "role",
        "foto_profile",
        "foto_profile_url",
      ],
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
  // Jika password tidak kosong dan konfirmasi password cocok, maka kita update password
  if (password && password !== "") {
    if (password !== confPassword)
      return res
        .status(400)
        .json({ msg: "Password dan Confirm Password Harus Sama" });
    hashPassword = await argon2.hash(password); // Hash password baru
  }

  // Menangani foto profil jika ada
  let fotoProfileUrl = user.foto_profile_url;
  let fotoProfile = user.foto_profile;
  if (req.file) {
    fotoProfile = req.file.filename;
    fotoProfileUrl = req.file.path;
  }

  try {
    await Admins.update(
      {
        name: name,
        email: email,
        hp: hp,
        password: hashPassword,
        foto_profile: fotoProfile,
        foto_profile_url: fotoProfileUrl,
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
