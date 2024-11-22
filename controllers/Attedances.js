import Attendances from "../models/AttendanceModel.js";
import Students from "../models/StudentModel.js";
import path from "path";

export const clockIn = async (req, res) => {
  const user = await Students.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

  const { locationClockIn, latitude, longitude } = req.body; // Include latitude and longitude
  const file = req.file;

  if (!file) return res.status(400).json({ msg: "Mohon unggah wajah" });

  const ext = path.extname(file.originalname);
  const facePhotoClockInFile = `clockin_${Date.now()}${ext}`;

  try {
    const date = new Date().toISOString().split("T")[0];
    const userId = user.id;

    const existingAttendance = await Attendances.findOne({
      where: {
        studentId: userId,
        date: date,
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: "Sudah melakukan clock in hari ini" });
    }

    const newAttendance = await Attendances.create({
      studentId: userId,
      clockIn: new Date(),
      locationClockIn,
      latitude, // Save latitude
      longitude, // Save longitude
      facePhotoClockIn: facePhotoClockInFile,
      facePhotoClockInUrl: `/assets/attendances/${facePhotoClockInFile}`,
      date: date,
    });

    res.status(201).json({ msg: "Clock in berhasil", data: newAttendance });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const clockOut = async (req, res) => {
  const user = await Students.findOne({
    where: { uuid: req.params.id },
  });

  if (!user) {
    return res.status(404).json({ msg: "User Tidak Ditemukan" });
  }

  const { locationClockOut, latitude, longitude } = req.body; // Include latitude and longitude
  const file = req.file;

  if (!file) return res.status(400).json({ msg: "Mohon unggah wajah" });

  const ext = path.extname(file.originalname);
  const facePhotoClockOutFile = `clockout_${Date.now()}${ext}`;

  try {
    const date = new Date().toISOString().split("T")[0];
    const studentId = user.id;

    const existingAttendance = await Attendances.findOne({
      where: {
        studentId: studentId,
        date: date,
      },
    });

    if (!existingAttendance) {
      return res.status(404).json({ msg: "Belum melakukan clock in hari ini" });
    }

    const existingClockOut = await Attendances.findOne({
      where: {
        studentId: studentId,
        date: date,
      },
    });

    if (existingClockOut) {
      return res
        .status(400)
        .json({ msg: "Sudah melakukan clock out hari ini" });
    }

    await Attendances.update(
      {
        clockOut: new Date(),
        locationClockOut,
        latitude, // Save latitude
        longitude, // Save longitude
        facePhotoClockOut: facePhotoClockOutFile,
        facePhotoClockOutUrl: `/assets/attendances/${facePhotoClockOutFile}`,
      },
      {
        where: { id: existingAttendance.id },
      }
    );

    res
      .status(200)
      .json({ msg: "Clock out berhasil", data: existingAttendance });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
