import ProtectedRoute from "../../ProtectedRoute";

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
import LeaveHistory from "../pages/adminpage/LeaveHistory";
import StudentMonthlySummary from "../pages/studentpage/StudentMonthlySummary";
import StudentDailyAttendance from "../pages/studentpage/StudentDailyAttendance";
import LeaveApply from "../pages/studentpage/LeaveApply";
import StudentLeaveHistory from "../pages/studentpage/StudentLeaveHistory";
import Mentorlogin from "../pages/mentorpage/Mentorlogin";
import Mentorcreate from "../pages/adminpage/Mentorcreate";
import MentorDashboard from "../pages/mentorpage/MentorDashboard";
import MyStudents from "../pages/mentorpage/MyStudents";
import LeaveHistory1 from "../pages/mentorpage/LeaveHistory1";
import DailyAttendance1 from "../pages/mentorpage/DailyAttendance1";
import MonthlySummary1 from "../pages/mentorpage/MonthlySummary1";
import Punchinrequest from "../pages/mentorpage/Punchinrequest";


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

          <Route path="/studentsdashboard" element={

              <Studentsdashboard />
            
          
          } />

          <Route path="/attendance" element={<Attendance />} />

          <Route path="/attendance" element={<Attendance />} />

          <Route path="/dailyAttendance" element={<DailyAttendance />} />
          <Route path="/monthlySummary" element={<MonthlySummary />} />
          <Route path="/adminLeaveRequest" element={<AdminLeaveRequest />} />
          <Route path="/leaveHistory" element={<LeaveHistory />} />

          <Route
            path="/studentMonthlySummary"
            element={<StudentMonthlySummary />}
          />
          <Route
            path="/StudentDailyAttendance"
            element={<StudentDailyAttendance />}
          />

          <Route
            path="/studentMonthlySummary"
            element={<StudentMonthlySummary />}
          />

          <Route
            path="/StudentLeaveHistory"
            element={<StudentLeaveHistory />}
          />
          <Route path="/LeaveApply" element={<LeaveApply />} />

          {/* mentor */}
          <Route path="/mentorlogin" element={<Mentorlogin />} />
          <Route path="/mentorcreate" element={<Mentorcreate />} />
          <Route path="/mentordashboard" element={<MentorDashboard />} />
          <Route path="/mystudents" element={<MyStudents />} />
          <Route path="/dailyattendance1" element={<DailyAttendance1 />} />
          <Route path="/monthlysummary1" element={<MonthlySummary1/>} />
          <Route path="/leavehistory1" element={<LeaveHistory1/>} />


          <Route path="/punchinrequest" element={<Punchinrequest/>}/>
          
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default LayoutRoutes;
