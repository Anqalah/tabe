import argon2 from "argon2";
import Students from "../models/StudentModel.js";
import Attendances from "../models/AttendanceModel.js";
import fs from "fs";
import path from "path";

export const getStudents = async (req, res) => {
  try {
    const response = await Students.findAll({
      attributes: [
        "uuid",
        "role",
        "email",
        "name",
        "kelas",
        "umur",
        "alamat",
        "hp",
        "bidang",
        "jk",
        "foto_profile",
        "face_image",
      ],
      include: [
        {
          model: Attendances,
          attributes: [
            "ClockIn",
            "ClockOut",
            "Date",
            "LocationClockIn",
            "LocationClockOut",
            "facePhotoClockIn",
            "facePhotoClockOut",
          ],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const response = await Students.findOne({
      attributes: [
        "uuid",
        "name",
        "kelas",
        "jk",
        "hp",
        "bidang",
        "email",
        "role",
        "foto_profile",
      ],
      where: { uuid: req.params.id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateStudent = async (req, res) => {
  const user = await Students.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  const {
    name,
    jk,
    umur,
    alamat,
    hp,
    bidang,
    kelas,
    email,
    password,
    confPassword,
  } = req.body;
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
    await Students.update(
      {
        name: name,
        jk: jk,
        umur: umur,
        alamat: alamat,
        hp: hp,
        bidang: bidang,
        kelas: kelas,
        email: email,
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

export const deleteStudent = async (req, res) => {
  const user = await Students.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

  const extractPathFromURL = (url) => {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/^\/+/, ""); // buang '/' di awal
      return path.join(process.cwd(), "assets", pathname);
    } catch (err) {
      console.error("Gagal parsing URL:", err.message);
      return null;
    }
  };

  // Dapatkan path lokal untuk face_image dan foto_profile
  const faceImagePath = user.face_image
    ? extractPathFromURL(user.face_image)
    : null;
  const profileImagePath = user.foto_profile
    ? extractPathFromURL(user.foto_profile)
    : null;

  // Hapus face_image jika ada
  if (faceImagePath && fs.existsSync(faceImagePath)) {
    try {
      fs.unlinkSync(faceImagePath);
      console.log("Face image deleted:", faceImagePath);
    } catch (err) {
      console.error("Gagal menghapus face image:", err.message);
    }
  }

  // Hapus foto_profile jika ada
  if (profileImagePath && fs.existsSync(profileImagePath)) {
    try {
      fs.unlinkSync(profileImagePath);
      console.log("Foto profile deleted:", profileImagePath);
    } catch (err) {
      console.error("Gagal menghapus foto profile:", err.message);
    }
  }

  try {
    await Students.destroy({ where: { id: user.id } });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
