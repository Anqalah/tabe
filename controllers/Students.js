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
  try {
    const student = await Students.findOne({
      where: { uuid: req.params.id },
    });
    if (!student) return res.status(404).json({ msg: "User Tidak Ditemukan" });

    if (req.role !== "Admin" && req.uuid !== student.uuid) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }

    const { name, jk, umur, alamat, hp, email, password, confPassword } =
      req.body;

    if (password && password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password dan Konfirmasi Password harus sama" });
    }

    let hashPassword = student.password;
    if (password && password !== "") {
      hashPassword = await argon2.hash(password);
    }

    let fotoPath = student.foto_profile;
    if (req.file) {
      const fileName = req.file.filename;
      const fileDir = "assets/profile_images";
      const fullPath = path.join(fileDir, fileName);

      if (student.foto_profile) {
        const oldPath = path.resolve(
          student.foto_profile.replace(
            `${req.protocol}://${req.get("host")}/`,
            ""
          )
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      fotoPath = `${req.protocol}://${req.get("host")}/${fullPath}`;
    }

    await Students.update(
      {
        name,
        jk,
        umur,
        alamat,
        hp,
        email,
        password: hashPassword,
        foto_profile: fotoPath,
      },
      { where: { id: student.id } }
    );

    return res.status(200).json({
      msg: "Profil berhasil diperbarui",
      foto_profile: fotoPath,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(400).json({ msg: error.message });
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
