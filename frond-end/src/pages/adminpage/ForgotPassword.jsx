import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3001/admin/forgotpassword",
        { email }
      );

      if (res.data.success) {
        alert("OTP sent to your email");
        setShowOtpModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/admin/verify-otp",
        { email, otp }
      );

      if (res.data.success) {
        setShowOtpModal(false);
        setShowPasswordModal(true);
      }
    } catch {
      alert("Invalid OTP");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/resetpassword",
        { email, newPassword }
      );

      if (res.data.success) {
        alert("Password reset successful");
        navigate("/");
      }
    } catch {
      alert("Failed to reset password");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
            FORGOT PASSWORD
          </h2>

          <form onSubmit={sendOtp} className="space-y-5">
            <div>
              <label className="block text-[#1679AB] mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="w-full py-3 bg-[#141E46] text-white rounded-lg">
              Send OTP
            </button>
          </form>
        </div>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm">
            <h3 className="text-xl font-bold text-[#1679AB] mb-4">
              Enter OTP
            </h3>

            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg mb-4"
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOtp}
              className="w-full py-2 bg-[#141E46] text-white rounded-lg"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm">
            <h3 className="text-xl font-bold text-[#1679AB] mb-4">
              Reset Password
            </h3>

            <input
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-3 border rounded-lg mb-3"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border rounded-lg mb-4"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={resetPassword}
              className="w-full py-2 bg-[#141E46] text-white rounded-lg"
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ForgotPassword;
