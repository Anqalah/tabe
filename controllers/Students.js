import argon2 from "argon2";
import Students from "../models/StudentModel.js";
import Attendances from "../models/AttendanceModel.js";

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
      ],
      where: { uuid: req.params.id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const AddStudent = async (req, res) => {
  try {
    const { name, kelas, jk, hp, bidang, email, password, confPassword } =
      req.body;

    // Check password matching
    if (password !== confPassword) {
      return res.status(400).json({ error: "Password tidak cocok" });
    }

    // Check if email already registered
    const existing = await Students.findOne({
      where: { email },
    });
    if (existing) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    // Create student
    const student = await Students.create({
      name,
      kelas,
      jk,
      hp,
      bidang,
      email,
      password: hashPassword,
    });

    res.json({
      success: true,
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ error: "Gagal menyelesaikan registrasi" });
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
  try {
    await Students.destroy({ where: { id: user.id } });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
