

import ProtectedRoute from "../../ProtectedRoute";

import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/adminpage/AdminLogin'
import Studentsdashboard from '../pages/studentpage/Studentsdashboard'
import Admindashboard from '../pages/adminpage/Admindashboard'
import Course from '../pages/adminpage/Course'
import StudentCreate from '../pages/adminpage/StudentCreate'
import SideBarStudent from "../pages/studentpage/SideBarStudent";
import Attendance from "../pages/adminpage/Attendance"


function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route
            path="/adminlogin"
            element={
             
                <AdminLogin />
           
            }
          />
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute role ="admin">
                <Admindashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/student"
           element={
          <ProtectedRoute role ="admin">
            <StudentCreate/>
          </ProtectedRoute>}/>


        <Route path="/studentsdashboard" element={<Studentsdashboard />} />

        <Route path="/sidebarstudent" element={<SideBarStudent />} />
        
        <Route path='/studentsdashboard' element={<Studentsdashboard/>}/>
        
        
         <Route path='/course' element={<Course/>}/>
       
         <Route path='/attendance' element={<Attendance/>}/>
      </Routes>

      </BrowserRouter>
    </>
  );
}

export default LayoutRoutes;
