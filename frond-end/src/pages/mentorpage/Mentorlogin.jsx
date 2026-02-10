import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

function Mentorlogin() {
  const navigate = useNavigate();

  // ===== STATES =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // login button loading
  const [otpLoading, setOtpLoading] = useState(false); // OTP sending indicator

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ===== LOGIN =====
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const res = await api.post("/mentor/mentorlogin", {
        email,
        password,
      });


      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: res.data.message || "Email or password is incorrect!",
        });
        return;
      }

      const { token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", "mentor");

      const decoded = jwtDecode(token);
      const timeout = decoded.exp * 1000 - Date.now();

      // Auto logout after token expiry
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/mentorlogin";
      }, timeout);

      Swal.fire({

        title: "Login Successful!",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
      }).then(() => navigate("/mentordashboard"));
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

  // ===== FORGOT PASSWORD =====
  const sendOtp = async () => {

    if (!forgotEmail) return alert("Please enter email");


    try {
      setOtpLoading(true);

      await api.post("/mentor/forgot-password", {
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
      await api.post("/mentor/verify-otp", {
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
      await api.post("/mentor/reset-password", {
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
      });
    }
  };

  // ===== RESET FORM =====
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
      {/* ===== YOUR ORIGINAL DESIGN (UNCHANGED) ===== */}

      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md border-white/50">
          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
            MENTOR LOGIN
          </h2>

          <p className="text-center text-gray-400 mb-8">
            Login to your account
          </p>

          <form onSubmit={login} className="space-y-7">
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />
              <label
                className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none 
                peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold
                peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="peer w-full px-5 py-4 rounded-2xl text-black border-2 border-blue-200 bg-transparent focus:outline-none focus:border-[#1679AB] transition-all placeholder-transparent"
              />
              <label
                className="absolute left-4 top-4 px-2 bg-[#EEF6FB] text-gray-400 transition-all pointer-events-none 
                peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm peer-focus:text-[#1679AB] peer-focus:font-bold
                peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1679AB] peer-[:not(:placeholder-shown)]:font-bold"
              >
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
              className="w-full py-4 bg-[#141E46] hover:bg-[#2e3656] text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>

      {/* ===== MODALS (UNCHANGED DESIGN) ===== */}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => {
                setShowEmailModal(false);
                resetForm();
              }}
              className=" absolute top-3 right-3"
            >
              {" "}
              ✕
            </button>
            <h2 className=" text-lg font-semibold mb-4 w-full flex justify-center items-center">
              Forgot Password
            </h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full border p-2 rounded m"
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
              className=" absolute top-3 right-3"
            >
              {" "}
              ✕
            </button>
            <h2 className=" text-lg font-semibold mb-4 w-full flex justify-center items-center">
              Enter Otp
            </h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-4 mt-5"
            />
            <button
              onClick={verifyOtpHandler}
              className="w-full bg-[#141E46] text-white py-2 rounded mt-5"
            >
              Confirm OTP
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
              className=" absolute top-3 right-3"
            >
              {" "}
              ✕
            </button>
            <h2 className=" text-lg font-semibold mb-4 w-full flex justify-center items-center">
              Reset Password
            </h2>
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
            <button
              onClick={resetPasswordHandler}
              className="w-full bg-[#141E46] text-white py-2 rounded mt-5"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Mentorlogin;
