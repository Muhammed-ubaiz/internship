import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { FaLock } from 'react-icons/fa'

import { jwtDecode } from 'jwt-decode'


function Mentorlogin() {
  const navigate = useNavigate()

  // ===== EXISTING STATES (UNCHANGED) =====
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const [forgotEmail, setForgotEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // ===== EXISTING LOGIN FUNCTION (UNCHANGED) =====
  const login = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:3001/mentor/mentorlogin",
        { email, password },
      )


      if (!res.data.success) {
        alert(res.data.message || "Login failed")
        return
      }

      navigate("/mentordashboard")
    } catch (error) {
      console.error("LOGIN ERROR:", error)
      alert(error.response?.data?.message || "Something went wrong")

    if (!res.data.success) {
      alert(res.data.message || "Login failed");
      return;

    }
  }


const sendOtp = async () => {
  try {
    await axios.post("http://localhost:3001/mentor/forgot-password", {
      email: forgotEmail,
    });
    alert("OTP sent to your email!");
    setShowEmailModal(false);
    setShowOtpModal(true);
  } catch (error) {
    alert(error.response?.data?.message || "Error sending OTP");
  }
};


const verifyOtpHandler = async () => {
  try {
    await axios.post("http://localhost:3001/mentor/verify-otp", {
      email: forgotEmail,
      otp,
    });
    alert("OTP verified! Enter your new password.");
    setShowOtpModal(false);
    setShowResetModal(true);
  } catch (error) {
    alert(error.response?.data?.message || "Invalid OTP");
  }
};


    const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      const decoded = jwtDecode(token);
      const timeout = decoded.exp * 1000 - Date.now();

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/mentorlogin";
      }, timeout);

    navigate("/mentordashboard");


const resetPasswordHandler = async () => {
  try {
    await axios.post("http://localhost:3001/mentor/reset-password", {
      email: forgotEmail,
      newPassword,
      confirmPassword,
    });
    alert("Password reset successfully!");
    setShowResetModal(false);
  } catch (error) {
    alert(error.response?.data?.message || "Error resetting password");
  }
};



  return (
    <>
      
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">

          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
            MENTOR LOGIN
          </h2>

          <p className="text-center text-gray-400 mb-8">
            Login to your account
          </p>

          <form onSubmit={login} className="space-y-5">
            <div className=' relative'>
             
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />

               <label className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none 
                peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold
                peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold"
            >Email</label>

            </div>

            <div className=' relative'>
              
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
              className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />

              <label className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none 
                peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold
                peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold">Password</label>

            </div>

            <div className="flex justify-end text-sm text-gray-400">
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="hover:text-[#1679AB]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
            className="w-full py-4 bg-[#141E46] hover:bg-[#2e3656] text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>


     {showEmailModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-96 relative">
      <button
        onClick={() => setShowEmailModal(false)}
        className="absolute top-3 right-3"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold mb-4 w-full flex justify-center items-center">Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        className="w-full border p-2 rounded mb-4 mt-5"
      />

     <button onClick={sendOtp} className="w-full bg-[#141E46] text-white py-2 rounded mt-5">
  Send OTP
</button>

    </div>
  </div>
)}



     {showOtpModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-96 relative">
      <button
        onClick={() => setShowOtpModal(false)}
        className="absolute top-3 right-3"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold mb-4 w-full flex justify-center items-center">Enter OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full border p-2 rounded mb-4 mt-5"
      />

     <button onClick={verifyOtpHandler} className="w-full bg-[#141E46] text-white py-2 rounded mt-5">
  Confirm OTP
</button>

    </div>
  </div>
)}


     {showResetModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-96 relative">
      <button
        onClick={() => setShowResetModal(false)}
        className="absolute top-3 right-3"
      >
        ✕
      </button>

    

      <h2 className="text-lg font-semibold mb-4 w-full flex justify-center items-center">Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border p-2 rounded mb-3 mt-5"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

     <button onClick={resetPasswordHandler} className="w-full bg-[#141E46] text-white py-2 rounded mt-5 ">
  Confirm
</button>
    </div>
  </div>
)}

    </>
  )
}

export default Mentorlogin
