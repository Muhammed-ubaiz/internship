
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminpage/AdminLogin";
import Studentsdashboard from "../pages/Studentsdashboard";
import Admindashboard from "../pages/adminpage/Admindashboard";
import SideBarStudent from "../pages/studentpage/SideBarStudent";

import ProtectedRoute from "../../ProtectedRoute";

import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/adminpage/AdminLogin'
import Studentsdashboard from '../pages/studentpage/Studentsdashboard'
import Admindashboard from '../pages/adminpage/Admindashboard'
import Course from '../pages/adminpage/Course'
import StudentCreate from '../pages/adminpage/StudentCreate'


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
              <ProtectedRoute>
                <Admindashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/studentsdashboard" element={<Studentsdashboard />} />

          <Route path="/sidebarstudent" element={<SideBarStudent />} />
        </Routes>

      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/studentsdashboard' element={<Studentsdashboard/>}/>
        <Route path='/admindashboard' element={<Admindashboard/>}/>
         <Route path='/course' element={<Course/>}/>
         <Route path='/student' element={<StudentCreate/>}/>
      </Routes>

      </BrowserRouter>
    </>
  );
}

export default LayoutRoutes;
