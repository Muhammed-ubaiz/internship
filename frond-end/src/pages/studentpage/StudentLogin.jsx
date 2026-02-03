import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";


function StudentLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:3001/student/checkstudent",
      { email, password }
    );

    if (!res.data.success) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Email or password is incorrect!",
      });
      return;
    }

    const { token} = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("role", "student");

    const decoded = jwtDecode(token);
    const expiry = decoded.exp * 1000;
    const timeout = expiry - Date.now();

    setTimeout(()=>{
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/";
    },timeout);

    Swal.fire({
      
      title: "Login Successful!",
      icon: "success",
      draggable: true,
      timer: 1000,
      showConfirmButton: false,
    }).then(() => navigate("/studentsdashboard"));

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || "Something went wrong!",
     
    });
  } finally {
    setLoading(false);
  }
};


  const sendOtp = async () => {
   

    try {
      setOtpLoading(true);

      await axios.post("http://localhost:3001/student/send-otp", {
        email: forgotEmail,
      });

       Swal.fire({
              title: "OTP Sent!",
              text: "Check your email.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

      setShowEmailModal(false);
      setShowOtpModal(true);
    } catch (error) {
      Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.response?.data?.message || "Error sending OTP",
            });

    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpHandler = async () => {
    try {
      await axios.post("http://localhost:3001/student/verify-otp", {
        email: forgotEmail,
        otp,
      });

       Swal.fire({
              title: "OTP Verified!",
              text: "Enter your new password.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
      
      setShowOtpModal(false);
      setShowResetModal(true);
    } catch (error) {
      Swal.fire({
              icon: "error",
              title: "Invalid OTP",
              text: error.response?.data?.message || "Please try again",
            });
    }
  };

  const resetPasswordHandler = async () => {
    try {
      await axios.post("http://localhost:3001/student/reset-password", {
        email: forgotEmail,
        newPassword,
        confirmPassword,
      });

       Swal.fire({
             title: "Password Reset!",
             text: "You can now login with your new password.",
             icon: "success",
             timer: 1500,
             showConfirmButton: false,
           });
      setShowResetModal(false);

      resetForm();
    } catch (error) {
Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
      });    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowEmailModal(false);
    setShowOtpModal(false);
    setShowResetModal(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-3xl shadow-2xl w-[90%] max-w-md border-white/50">
          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
            STUDENT LOGIN
          </h2>

          <p className="text-center text-gray-400 mb-8">
            Login to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-7">
            {/* EMAIL */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="peer w-full px-5 py-4 rounded-2xl border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] placeholder-transparent"
              />
              <label className="absolute left-4 top-4 bg-[#EEF6FB] px-2 text-gray-400 transition-all peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="peer w-full px-5 py-4 rounded-2xl border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] placeholder-transparent"
              />
              <label className="absolute left-4 top-4 bg-[#EEF6FB] px-2 text-gray-400 transition-all peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                Password
              </label>
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
              disabled={loading}
              className="w-full py-4 bg-[#141E46] text-white font-bold rounded-2xl"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => {
                setShowEmailModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-center mb-4">
              Forgot Password
            </h2>
           <input
  type="Email"
  placeholder="Enter your email"
  required
  value={forgotEmail}
  onChange={(e) => setForgotEmail(e.target.value)}
  className="w-full border p-2 rounded "
/>

{otpLoading && (
  <p className="text-sm text-blue-600 mt-2">
    OTP sending...
  </p>
)}


            <button
              onClick={sendOtp}
              className="w-full bg-[#141E46] text-white py-2 rounded mt-5"
            >
              Send OTP
            </button>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => {
                setShowOtpModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-center mb-4">
              Enter OTP
            </h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <button
              onClick={verifyOtpHandler}
              className="w-full bg-[#141E46] text-white py-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => {
                setShowResetModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-center mb-4">
              Reset Password
            </h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <button
              onClick={resetPasswordHandler}
              className="w-full bg-[#141E46] text-white py-2 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentLogin;
