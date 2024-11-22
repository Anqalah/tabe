import { v2 as cloudinary } from "cloudinary";
import SequelizeStore from "connect-session-sequelize";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import db from "./config/Database.js";
import AdminRoute from "./routes/AdminRoute.js";
import AttedanceRoute from "./routes/AttedanceRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import TeacherRoute from "./routes/TeacherRoute.js";

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({ db: db });
// try {
//   await db.authenticate();
// await Admins.sync({ force: true });
//   await Teachers.sync();
//   await Students.sync();
//   await Attendances.sync({ force: true });
// } catch (error) {
//   console.error(error);
// }
// store.sync();

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: "dw30kwicp",
    secure: true,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });

  //   // Upload an image
  //   const uploadResult = await cloudinary.uploader
  //     .upload(
  //       "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
  //       {
  //         public_id: "shoes",
  //       }
  //     )
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   console.log(uploadResult);

  //   // Optimize delivery by resizing and applying auto-format and auto-quality
  //   const optimizeUrl = cloudinary.url("shoes", {
  //     fetch_format: "auto",
  //     quality: "auto",
  //   });

  //   console.log(optimizeUrl);

  //   // Transform the image: auto-crop to square aspect_ratio
  //   const autoCropUrl = cloudinary.url("shoes", {
  //     crop: "auto",
  //     gravity: "auto",
  //     width: 500,
  //     height: 500,
  //   });

  //   console.log(autoCropUrl);
})();

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    secure: "auto",
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(AuthRoute);
app.use(AdminRoute);
app.use(TeacherRoute);
app.use(StudentRoute);
app.use(AttedanceRoute);

app.listen(process.env.APP_PORT, () => {
  console.log("Server Sedang Berjalan...");
});
