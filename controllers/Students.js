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
        "umur",
        "alamat",
        "hp",
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
        "jk",
        "hp",
        "email",
        "role",
        "foto_profile",
        "face_image",
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
    // 1. Ambil student berdasarkan UUID di params
    const student = await Students.findOne({
      where: { uuid: req.params.id },
    });

    if (!student) {
      return res.status(404).json({ msg: "User Tidak Ditemukan" });
    }

    // 2. Cek otorisasi
    if (req.role !== "Admin" && req.uuid !== student.uuid) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }

    // 3. Ambil body
    const { name, jk, umur, alamat, hp, email, password, confPassword } =
      req.body;

    // 4. Validasi password jika mau diubah
    if (password && password !== confPassword) {
      return res.status(400).json({
        msg: "Password dan Konfirmasi Password harus sama",
      });
    }

    // 5. Susun objek updateData (hanya field yang dikirim)
    const updateData = {};

    if (typeof name !== "undefined") updateData.name = name;
    if (typeof jk !== "undefined") updateData.jk = jk;
    if (typeof umur !== "undefined") updateData.umur = umur;
    if (typeof alamat !== "undefined") updateData.alamat = alamat;
    if (typeof hp !== "undefined") updateData.hp = hp;
    if (typeof email !== "undefined") updateData.email = email;

    // 6. Hash password hanya jika benar-benar diisi
    if (password && password.trim() !== "") {
      const hashPassword = await argon2.hash(password.trim());
      updateData.password = hashPassword;
    }

    // Helper: hapus file lama dari disk
    const deleteFileByUrl = (url) => {
      if (!url) return;
      try {
        const relativePath = url.replace(
          `${req.protocol}://${req.get("host")}/`,
          ""
        );
        const absPath = path.resolve(relativePath);
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
        }
      } catch (e) {
        console.warn("Gagal menghapus file lama:", e.message);
      }
    };

    // Helper: buat URL file baru
    const saveFileAndGetUrl = (file, subdir) => {
      const fileDir = path.join("assets", subdir); // contoh: assets/profile_images
      const dirPath = path.resolve(fileDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const fullPath = path.join(fileDir, file.filename);
      return `${req.protocol}://${req.get("host")}/${fullPath}`;
    };

    // a) foto_profile (foto profil biasa)
    let newFotoProfileUrl = null;
    const profileFile =
      req.files?.foto_profile?.[0] ||
      (req.file && req.file.fieldname === "foto_profile" ? req.file : null);

    if (profileFile) {
      // hapus foto_profile lama jika ada
      if (student.foto_profile) {
        deleteFileByUrl(student.foto_profile);
      }
      newFotoProfileUrl = saveFileAndGetUrl(profileFile, "profile_images");
      updateData.foto_profile = newFotoProfileUrl;
    }

    // b) face_image (foto untuk face recognition)
    let newFaceImageUrl = null;
    const faceFile =
      req.files?.face_image?.[0] ||
      (req.file && req.file.fieldname === "face_image" ? req.file : null);

    if (faceFile) {
      // hapus face_image lama jika ada
      if (student.face_image) {
        deleteFileByUrl(student.face_image);
      }
      newFaceImageUrl = saveFileAndGetUrl(faceFile, "face_images");
      updateData.face_image = newFaceImageUrl;
    }

    // 8. Kalau tidak ada data yang berubah, jangan paksa update
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        msg: "Tidak ada data yang diubah",
        foto_profile: student.foto_profile,
        face_image: student.face_image,
      });
    }

    // 9. Lakukan update
    await Students.update(updateData, { where: { id: student.id } });

    return res.status(200).json({
      msg: "Profil berhasil diperbarui",
      foto_profile: newFotoProfileUrl || student.foto_profile,
      face_image: newFaceImageUrl || student.face_image,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
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
