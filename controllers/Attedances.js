import Attendances from "../models/AttendanceModel.js";
import Students from "../models/StudentModel.js";

export const getAttendances = async (req, res) => {
  try {
    const response = await Attendances.findAll({
      attributes: [
        "uuid",
        "ClockIn",
        "ClockOut",
        "Date",
        "LocationClockIn",
        "LocationClockOut",
        "facePhotoClockIn",
        "facePhotoClockOut",
      ],

      include: [
        {
          model: Students,
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
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const student = await Students.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "createdAt"],
    });

    if (!student)
      return res.status(404).json({ msg: "Siswa tidak ditemukan." });

    console.log("studentId", student.id);

    const response = await Attendances.findOne({
      where: { studentId: student.id },
      order: [["date", "DESC"]],
      attributes: [
        "uuid",
        "ClockIn",
        "ClockOut",
        "Date",
        "LocationClockIn",
        "LocationClockOut",
        "facePhotoClockIn",
        "facePhotoClockOut",
      ],
      include: [
        {
          model: Students,
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
        },
      ],
    });
    if (!response) {
      return res.status(404).json({ msg: "Data kehadiran tidak ditemukan." });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getFastestAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const fastest = await Attendances.findOne({
      where: {
        date: today,
      },
      order: [["clockIn", "ASC"]],
      include: [
        {
          model: Students,
          attributes: ["name", "kelas"],
        },
      ],
    });

    res.status(200).json(fastest);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { studentId, latitude, longitude, type } = req.body;

    if (!req.file)
      return res.status(400).json({ msg: "Foto wajah wajib diunggah." });

    // Cari student berdasarkan UUID
    const student = await Students.findOne({ where: { uuid: studentId } });
    if (!student)
      return res.status(404).json({ msg: "Mahasiswa tidak ditemukan." });

    const today = new Date().toISOString().split("T")[0];
    const internalStudentId = student.id;

    // Cek apakah sudah ada absensi hari ini
    const existingAttendance = await Attendances.findOne({
      where: {
        studentId: internalStudentId,
        date: today,
      },
    });

    const photoPath = req.file.filename;
    const photoUrl = `${req.protocol}://${req.get(
      "host"
    )}/assets/attendances/${photoPath}`;

    if (type === "clockIn") {
      if (existingAttendance) {
        return res
          .status(400)
          .json({ msg: "Anda sudah melakukan clock-in hari ini." });
      }

      const newAttendance = await Attendances.create({
        studentId: internalStudentId,
        clockIn: new Date(),
        date: today,
        locationClockIn: `${latitude},${longitude}`,
        facePhotoClockIn: photoUrl,
      });

      const createdAttendance = await Attendances.findOne({
        where: { id: newAttendance.id },
        attributes: ["uuid"],
      });

      return res.status(201).json({
        msg: "Clock-in berhasil.",
        data: {
          uuid: createdAttendance.uuid,
          photoUrl,
        },
      });
    }

    if (type === "clockOut") {
      if (!existingAttendance) {
        return res
          .status(400)
          .json({ msg: "Silakan clock In terlebih dahulu." });
      }

      if (existingAttendance.clockOut) {
        return res
          .status(400)
          .json({ msg: "Anda sudah melakukan clock-out hari ini." });
      }

      existingAttendance.clockOut = new Date();
      existingAttendance.locationClockOut = `${latitude},${longitude}`;
      existingAttendance.facePhotoClockOut = photoUrl;
      await existingAttendance.save();

      return res.status(200).json({
        msg: "Clock-out berhasil.",
        photoUrl,
      });
    }

    return res.status(400).json({
      msg: "Tipe absensi tidak valid (gunakan clockIn atau clockOut).",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server." });
  }
};

export const updateAttendance = async (req, res) => {};
export const deleteAttendance = async (req, res) => {};
