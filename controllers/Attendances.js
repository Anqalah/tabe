import Attendances from "../models/AttendanceModel.js";
import Students from "../models/StudentModel.js";
import { Op } from "sequelize";

export const getHistoryAttendances = async (req, res) => {
  try {
    const student = await Students.findOne({
      where: { uuid: req.params.id },
    });
    if (!student)
      return res.status(404).json({ msg: "Siswa tidak ditemukan." });

    // Get month and year from query params
    const month = req.query.month ? parseInt(req.query.month) : null;
    const year = req.query.year ? parseInt(req.query.year) : null;

    /* ambil semua presensi si siswa pada bulan tsb */
    const whereClause = { studentId: student.id };

    if (month && year) {
      whereClause[Op.and] = [
        Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("Date")), month),
        Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("Date")), year),
      ];
    }

    const attendances = await Attendances.findAll({
      where: whereClause,
      order: [["Date", "ASC"]],
      attributes: [
        "uuid",
        "ClockIn",
        "ClockOut",
        "Date",
        "LocationClockIn",
        "LocationClockOut",
        "facePhotoClockIn",
        "facePhotoClockOut",
        "clockInConfidence",
        "clockOutConfidence",
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

    res.status(200).json(attendances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

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
          attributes: ["uuid", "name", "kelas", "jk", "hp", "email", "role"],
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
    // Dapatkan tanggal awal dan akhir hari ini
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const student = await Students.findOne({
      where: { id: req.params.id },
    });

    if (!student)
      return res.status(404).json({ msg: "Siswa tidak ditemukan." });

    const response = await Attendances.findOne({
      where: {
        studentId: student.id,
        Date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      attributes: [
        "uuid",
        "ClockIn",
        "ClockOut",
        "Date",
        "LocationClockIn",
        "LocationClockOut",
        "facePhotoClockIn",
        "facePhotoClockOut",
        "clockInConfidence",
        "clockOutConfidence",
      ],
      include: [
        {
          model: Students,
          attributes: ["uuid", "name", "kelas", "jk", "hp", "email", "role"],
        },
      ],
      order: [["Date", "DESC"]], // Urutkan berdasarkan tanggal terbaru
    });

    if (!response) {
      return res
        .status(404)
        .json({ msg: "Data kehadiran hari ini tidak ditemukan." });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const checkAttendanceStatus = async (req, res) => {
  try {
    const { uuid } = req.params;

    // 1. Cari siswa berdasarkan UUID
    const student = await Students.findOne({
      where: { uuid },
      attributes: ["id"],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // 2. Tentukan rentang waktu hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 3. Cari data absensi hari ini
    const attendance = await Attendances.findOne({
      where: {
        studentId: student.id,
        date: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    // 4. Format response
    res.status(200).json({
      success: true,
      data: {
        hasClockedIn: !!attendance?.clockIn,
        hasClockedOut: !!attendance?.clockOut,
        attendance,
      },
    });
  } catch (error) {
    console.error("Error checkAttendanceStatus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { studentId, latitude, longitude, type, confidence } = req.body;
    if (!req.file) {
      return res.status(400).json({ msg: "Foto wajah wajib diunggah." });
    }

    const student = await Students.findOne({ where: { uuid: studentId } });
    if (!student) {
      return res.status(404).json({ msg: "Siswa tidak ditemukan." });
    }

    const today = new Date().toISOString().split("T")[0];
    const internalStudentId = student.id;
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
        clockInConfidence: confidence,
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
      (existingAttendance.clockOutConfidence = confidence),
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
    console.error("Attendance error:", error);
    res.status(500).json({
      msg: error.message || "Terjadi kesalahan pada server.",
    });
  }
};

export const updateAttendance = async (req, res) => {};
export const deleteAttendance = async (req, res) => {};
