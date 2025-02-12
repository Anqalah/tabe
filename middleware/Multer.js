import multer from "multer";
import path from "path";
import fs from "fs";

// Konfigurasi multer untuk menyimpan file secara lokal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./assets/attendances/";
    // Buat folder jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Middleware untuk memeriksa duplikasi file
const checkFileDuplicate = (req, file, cb) => {
  const filePath = path.join("assets/attendances", file.originalname);
  // Cek jika file sudah ada
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File tidak ada, lanjutkan dengan upload
      cb(null, true);
    } else {
      // File sudah ada, tolak upload
      cb(
        new Error("File sudah ada, silakan gunakan nama yang berbeda."),
        false
      );
    }
  });
};

export const multer = multer({
  storage: storage,
  fileFilter: checkFileDuplicate, // Menggunakan middleware untuk memeriksa duplikasi
});
