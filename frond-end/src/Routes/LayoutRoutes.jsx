import ProtectedRoute from "../../ProtectedRoute";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminpage/AdminLogin";
import Studentsdashboard from "../pages/studentpage/Studentsdashboard";
import Admindashboard from "../pages/adminpage/Admindashboard";
import Course from "../pages/adminpage/Course";
import StudentCreate from "../pages/adminpage/StudentCreate";
import SideBarStudent from "../pages/studentpage/SideBarStudent";
import Attendance from "../pages/adminpage/DailyAttendance";
import StudentLogin from "../pages/studentpage/StudentLogin";
import DailyAttendance from "../pages/studentpage/DailyAttendance";
import MonthlySummary from "../pages/adminpage/MonthlySummary";
import AdminLeaveRequest from "../pages/adminpage/AdminLeaveRequest";

function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/" element={<StudentLogin />} />
          <Route

            path="/admindashboard"

           

            element={
              <ProtectedRoute role="admin">
                <Admindashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute role="admin">
                <StudentCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course"
            element={
              <ProtectedRoute role="admin">
                <Course />
              </ProtectedRoute>
            }
          />

          <Route path="/studentsdashboard" element={<Studentsdashboard />} />

          <Route path="/sidebarstudent" element={<SideBarStudent />} />

          <Route path="/studentsdashboard" element={<Studentsdashboard />} />


          <Route path="/attendance" element={<Attendance />}
          
          />

          
          <Route path="/studentlogin" element={<StudentLogin />} />
          <Route path="/dailyAttendance" element={<DailyAttendance />} />
          <Route path="/monthlySummary" element={<MonthlySummary />} />
          <Route path="/adminLeaveRequest" element={<AdminLeaveRequest />} />




            


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default LayoutRoutes;
