import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        "http://localhost:3001/student/checkstudent",
        { email,password }
      );
  
      if (response.data.success) {
        navigate("/studentsdashboard");
      }
  
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">

        <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
          STUDENT LOGIN
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-[#1679AB] mb-2">Email</label>
            <input
              onChange={(e) => setemail(e.target.value)}
              placeholder="Enter Your email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg text-black border"
            />
          </div>

          <div>
            <label className="block text-[#1679AB] mb-2">Password</label>
            <input
              onChange={(e) => setpassword(e.target.value)}
              placeholder="Enter Your password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg text-black border"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#141E46] text-white rounded-lg"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default StudentLogin;
