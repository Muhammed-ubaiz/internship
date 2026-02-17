import ProtectedRoute from "../../ProtectedRoute";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminpage/AdminLogin";
import Studentsdashboard from "../pages/studentpage/Studentsdashboard";
import Admindashboard from "../pages/adminpage/Admindashboard";
import Course from "../pages/adminpage/Course";
import StudentCreate from "../pages/adminpage/StudentCreate";
import StudentLogin from "../pages/studentpage/StudentLogin";
import DailyAttendance from "../pages/studentpage/DailyAttendance";
import MonthlySummary from "../pages/adminpage/MonthlySummary";
import AdminLeaveRequest from "../pages/adminpage/AdminLeaveRequest";
import LeaveHistory from "../pages/adminpage/LeaveHistory";
import StudentMonthlySummary from "../pages/studentpage/StudentMonthlySummary";
import LeaveApply from "../pages/studentpage/LeaveApply";
import StudentLeaveHistory from "../pages/studentpage/StudentLeaveHistory";
import MentorLogin from "../pages/mentorpage/MentorLogin";
import Mentorcreate from "../pages/adminpage/Mentorcreate";
import MentorDashboard from "../pages/mentorpage/MentorDashboard";
import MyStudents from "../pages/mentorpage/MyStudents";
import LeaveHistory1 from "../pages/mentorpage/LeaveHistory1";
import DailyAttendance1 from "../pages/mentorpage/DailyAttendance1";
import MonthlySummary1 from "../pages/mentorpage/MonthlySummary1";
import Punchinrequest from "../pages/mentorpage/Punchinrequest";
import AdminDailyAttendance from "../pages/adminpage/AdminDailyAttendance";

import Announcement from "../pages/mentorpage/Announcement";

import MentorLeaveRequest from "../pages/mentorpage/MentorLeaveRequest";
import Information from "../pages/adminpage/Information";
import MentorNotifications from "../pages/mentorpage/Mentornotification";
import StuentsNotification from "../pages/studentpage/StuentsNotification";
import SetPassword from "../pages/studentpage/SetPassword";



function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/mentorlogin" element={<MentorLogin />} />
          <Route path="/" element={<StudentLogin />} />
          <Route path="/information" element={<Information />} />
          <Route path="/mentornotification" element={<MentorNotifications />} />
          <Route path="/studentsnotification" element={<StuentsNotification />} />
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

          <Route
            path="/mentorcreate"
            element={
              <ProtectedRoute role="admin">
                <Mentorcreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute role="admin">
                <AdminDailyAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monthlySummary"
            element={
              <ProtectedRoute role="admin">
                <MonthlySummary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/adminLeaveRequest"
            element={
              <ProtectedRoute role="admin">
                <AdminLeaveRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaveHistory"
            element={
              <ProtectedRoute role="admin">
                <LeaveHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/studentsdashboard"
            element={
              <ProtectedRoute role="student">
                <Studentsdashboard />
              </ProtectedRoute>


            }
          />



          {/* <Route
            path="/dailyAttendance"
            element={
              <ProtectedRoute role="student">
                <DailyAttendance />
              </ProtectedRoute>
            }
          /> */}




          <Route
            path="/studentMonthlySummary"
            element={
              <ProtectedRoute role="student">
                <StudentMonthlySummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DailyAttendance"
            element={
              <ProtectedRoute role="student">
                <DailyAttendance />
              </ProtectedRoute>
            }
          />




          <Route
            path="/StudentLeaveHistory"
            element={
              <ProtectedRoute role="student">
                <StudentLeaveHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/LeaveApply"
            element={
              <ProtectedRoute role="student">
                <LeaveApply />
              </ProtectedRoute>
            }
          />

          {/* mentor */}

          <Route
            path="/mentordashboard"
            element={
              <ProtectedRoute role="mentor" >
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mystudents"
            element={
              <ProtectedRoute role="mentor">
                <MyStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dailyattendance1"
            element={
              <ProtectedRoute role="mentor" >
                <DailyAttendance1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monthlysummary1"
            element={
              <ProtectedRoute role="mentor">
                <MonthlySummary1 />
              </ProtectedRoute>
            }
          />

          <Route path="/mentorleaverequest" element={<MentorLeaveRequest />} />

          <Route
            path="/leavehistory1"
            element={
              <ProtectedRoute role="mentor" >
                <LeaveHistory1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/punchinrequest"
            element={
              <ProtectedRoute role="mentor">
                <Punchinrequest />
              </ProtectedRoute>
            }
          />
          <Route path="/announcement" element={<Announcement />} />

          <Route path="/set-password" element={<SetPassword />} />


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default LayoutRoutes;
