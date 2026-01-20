import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // login button loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/admin/login",
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const { token, role } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        const decoded = jwtDecode(token);
        const timeout = decoded.exp * 1000 - Date.now();

        // Auto logout after token expires
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/adminlogin";
        }, timeout);

        // SweetAlert success
        Swal.fire({
          title: "Login Successful!",
          icon: "success",
          draggable: true,
          timer: 1000,
          showConfirmButton: false,
        }).then(() => navigate("/admindashboard"));
      } else {
        // SweetAlert error
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Check your email and password",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Something went wrong",
        footer: '<a href="#">Need help?</a>',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-3xl shadow-2xl w-[90%] max-w-md border border-white/50">
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
            ADMIN LOGIN
          </h2>
          <p className="text-center text-gray-400 mb-8">Login to your account</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div className="relative">
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder=""
                className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />
              <label className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold">
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />
              <label className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold">
                Password
              </label>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2"></label>
              <a href="#" className="hover:text-[#1679AB]">
                Forgot password?
              </a>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#141E46] hover:bg-[#2e3656] text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
