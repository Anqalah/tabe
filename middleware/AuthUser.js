import jwt from "jsonwebtoken";
import Admins from "../models/AdminModel.js";
import Students from "../models/StudentModel.js";

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ msg: "Mohon login terlebih dahulu" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek apakah user ada di tabel Admins atau Students
    const user =
      (await Admins.findOne({ where: { uuid: decoded.uuid } })) ||
      (await Students.findOne({ where: { uuid: decoded.uuid } }));

    if (!user)
      return res.status(404).json({ msg: "User tidak ditemukan di sistem" });

    // Simpan ke req untuk middleware berikutnya
    req.userId = user.id;
    req.uuid = user.uuid;
    req.role = user.role;

    next();
  } catch (err) {
    console.error("verifyUser error:", err.message);
    return res
      .status(403)
      .json({ msg: "Token tidak valid atau sudah kadaluarsa" });
  }
};

export const adminOnly = (req, res, next) => {
  try {
    const { role, uuid } = req;

    // Admin boleh lanjut
    if (role === "Admin") return next();

    // Pemilik akun juga boleh (pastikan param id cocok)
    if (uuid === req.params.id) return next();

    return res.status(403).json({
      msg: "Akses ditolak: hanya Admin atau pemilik akun yang diizinkan",
    });
  } catch (error) {
    console.error("adminOnly error:", error.message);
    return res
      .status(500)
      .json({ msg: "Kesalahan server saat memeriksa akses" });
  }
};
