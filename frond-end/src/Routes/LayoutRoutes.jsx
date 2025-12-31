import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/adminpage/AdminLogin'
import Studentsdashboard from '../pages/Studentsdashboard'
import Admindashboard from '../pages/adminpage/Admindashboard'
import SideBarStudent from '../pages/studentpage/SideBarStudent'

function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/studentsdashboard' element={<Studentsdashboard/>}/>
        <Route path='/admindashboard' element={<Admindashboard/>}/>
        <Route path='/sidebarstudent' element={<SideBarStudent/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default LayoutRoutes
