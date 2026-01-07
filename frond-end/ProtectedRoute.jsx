import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children,role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")

  if (!token || role !== "admin") {
    return <Navigate to="/adminlogin" />;
  }
   
  if (role && userRole !== role) {
    
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute
