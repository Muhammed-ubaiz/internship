import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children,role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")

  // not logged in
  if (!token) {
    return <Navigate to="/adminlogin" replace />;
  }
  // role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }
  

  return children;
}

export default ProtectedRoute
