import Teachers from "../models/TeacherModel.js";
import argon2 from "argon2";

export const getTeachers = async (req, res) => {
  try {
    const response = await Teachers.findAll({
      attributes: ["uuid", "name", "hp", "jk", "alamat", "email", "role"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getTeacherById = async (req, res) => {
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

export const createTeacher = async (req, res) => {
  const { name, jk, umur, alamat, email, password, confPassword, hp } =
    req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password dan Confirm Password Harus Sama" });
  const hashPassword = await argon2.hash(password);
  try {
    await Teachers.create({
      name: name,
      jk: jk,
      umur: umur,
      alamat: alamat,
      email: email,
      hp: hp,
      password: hashPassword,
      role: "Teacher",
    });
    res.status(201).json({ msg: "Register Berhasil" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  const user = await Teachers.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  const { name, jk, umur, alamat, email, password, confPassword, hp } =
    req.body;
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
    await Teachers.update(
      {
        name: name,
        jk: jk,
        umur: umur,
        alamat: alamat,
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

export const deleteTeacher = async (req, res) => {
  const user = await Teachers.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });
  try {
    await Teachers.destroy({ where: { id: user.id } });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
