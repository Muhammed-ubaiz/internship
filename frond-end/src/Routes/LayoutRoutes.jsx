import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/adminpage/AdminLogin'
import Studentsdashboard from '../pages/studentpage/Studentsdashboard'
import Admindashboard from '../pages/adminpage/Admindashboard'
import Course from '../pages/adminpage/Course'

function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/studentsdashboard' element={<Studentsdashboard/>}/>
        <Route path='/admindashboard' element={<Admindashboard/>}/>
         <Route path='/course' element={<Course/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default LayoutRoutes
