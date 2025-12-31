import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/AdminLogin'
import Studentsdashboard from '../pages/Studentsdashboard'
import Admindashboard from '../pages/Admindashboard'

function LayoutRoutes() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/studentsdashboard' element={<Studentsdashboard/>}/>
        <Route path='/admindashboard' element={<Admindashboard/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default LayoutRoutes
