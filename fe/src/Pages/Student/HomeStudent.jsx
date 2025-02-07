import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/Layouts/StudentLayout";
import { getMe } from "../../Features/authSlice";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const HomeStudent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user: authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      const action = await dispatch(getMe());
      if (getMe.rejected.match(action)) {
        navigate("/");
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  if (!authUser) return null;

  return (
    <StudentLayout>
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <img
              src="/images/shoes1.jpg"
              alt="profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-md"
            />
            <div className="text-white">
              <h1 className="text-2xl font-bold">{authUser.name}</h1>
              <p className="text-sm opacity-90">{authUser.bidang}</p>
              <div className="flex items-center gap-1 mt-1">
                <UserCircleIcon className="w-5 h-5" />
                <span className="text-sm">{authUser.kelas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center transition-all hover:shadow-md">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-500">Hadir</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm text-center transition-all hover:shadow-md">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">2</p>
            <p className="text-sm text-gray-500">Izin</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm text-center transition-all hover:shadow-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <ClockIcon className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">1</p>
            <p className="text-sm text-gray-500">Alpa</p>
          </div>
        </div>

        {/* Schedule Calendar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Kalender Akademik
            </h2>
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Ujian Mid Semester</p>
                <p className="text-xs text-gray-500">15 Oktober 2024</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Batas Pengumpulan Tugas</p>
                <p className="text-xs text-gray-500">20 Oktober 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default HomeStudent;
