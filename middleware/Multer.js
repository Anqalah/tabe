import multer from "multer";
import path from "path";
import fs from "fs";

// Helper untuk membuat direktori jika belum ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ===== Konfigurasi untuk Upload Foto Profil (lama — tetap boleh dipakai di endpoint lain) =====
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./assets/profile_images/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname);
    const uniqueName = `profile-${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, uniqueName);
  },
});

const profileImageFilter = (req, file, cb) => {
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Hanya file gambar yang diperbolehkan"), false);
};

export const profileUpload = multer({
  storage: profileStorage,
  fileFilter: profileImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("foto");

// ===== Konfigurasi untuk Upload Gambar Wajah (lama — bisa dipakai di endpoint lain kalau perlu) =====
const faceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./assets/face_images/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname);
    const uniqueName = `face-${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, uniqueName);
  },
});

const imageFilter = (req, file, cb) => {
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Hanya file gambar yang diperbolehkan"), false);
};

export const faceUpload = multer({
  storage: faceStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ===== 🔥 Konfigurasi gabungan untuk updateStudent (foto_profile + face_image) =====
const studentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "./assets/uploads/";

    if (file.fieldname === "foto_profile") {
      dir = "./assets/profile_images/";
    } else if (file.fieldname === "face_image") {
      dir = "./assets/face_images/";
    }

    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === "face_image" ? "face" : "profile";
    const uniqueName = `${prefix}-${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, uniqueName);
  },
});

// middleware utama untuk PATCH /students/:id
export const studentUpload = multer({
  storage: studentImageStorage,
  fileFilter: imageFilter, // cek mimetype image/*
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "foto_profile", maxCount: 1 }, // foto profil biasa
  { name: "face_image", maxCount: 1 }, // foto wajah untuk face recognition
]);

// ===== Konfigurasi untuk Upload Presensi =====
const attendanceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./assets/attendances/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ Versi benar dari fileFilter (sinkron)
const checkFileDuplicate = (req, file, cb) => {
  const filePath = path.join("assets/attendances", file.originalname);
  if (fs.existsSync(filePath)) {
    cb(new Error("File sudah ada, gunakan nama berbeda."), false);
  } else {
    cb(null, true);
  }
};

export const attendanceUpload = multer({
  storage: attendanceStorage,
  fileFilter: checkFileDuplicate,
});
