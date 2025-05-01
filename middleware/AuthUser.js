import jwt from "jsonwebtoken";
import Admins from "../models/AdminModel.js";
import Teachers from "../models/TeacherModel.js";
import Students from "../models/StudentModel.js";

export const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Mohon login terlebih dahulu" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user =
      (await Admins.findOne({ where: { uuid: decoded.uuid } })) ||
      (await Teachers.findOne({ where: { uuid: decoded.uuid } })) ||
      (await Students.findOne({ where: { uuid: decoded.uuid } }));
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    req.userId = user.id;
    req.role = user.role;
    req.uuid = user.uuid;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Token tidak valid" });
  }
};

export const adminOnly = async (req, res, next) => {
  await verifyUser(req, res, async () => {
    const admin = await Admins.findOne({ where: { uuid: req.uuid } });
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ msg: "Akses hanya untuk Admin" });
    }
    next();
  });
};

