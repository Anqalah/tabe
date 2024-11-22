import Admins from "../models/AdminModel.js";
import Teachers from "../models/TeacherModel.js";
import Students from "../models/StudentModel.js";

export const verifyUser = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon Login Terlebih Dahulu" });
  }
  // Check in Admins table
  let user = await Admins.findOne({
    where: { uuid: req.session.userId },
  });
  // Check in Teachers table if not found in Admins
  if (!user) {
    user = await Teachers.findOne({
      where: { uuid: req.session.userId },
    });
  }
  // Check in Students table if not found in Admins or Teachers
  if (!user) {
    user = await Students.findOne({
      where: { uuid: req.session.userId },
    });
  }
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  req.userId = user.id;
  req.role = user.role;
  next();
};

export const adminOnly = async (req, res, next) => {
  // First, verify the user
  await verifyUser(req, res, async () => {
    const user = await Admins.findOne({
      where: { uuid: req.session.userId },
    });
    if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
    if (user.role !== "Admin")
      return res.status(403).json({ msg: "Akses Terlarang" });
    next();
  });
};
