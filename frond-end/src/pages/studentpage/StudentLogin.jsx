import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/student/checkstudent",
        { email, password }
      );

      if (!res.data.success) {
        alert("Check your email and password");
        return;
      }

      const { token, student } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", student.role);

      const decoded = jwtDecode(token);
      const timeout = decoded.exp * 1000 - Date.now();

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/";
      }, timeout);

      navigate("/studentsdashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post("http://localhost:3001/student/forgot-password", {
        email: forgotEmail,
      });

      alert("OTP sent to your email");
      setShowEmailModal(false);
      setShowOtpModal(true);
    } catch (error) {
      alert(error.response?.data?.message || "Error sending OTP");
    }
  };

  const verifyOtpHandler = () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }
    setShowOtpModal(false);
    setShowResetModal(true);
  };

  const resetPasswordHandler = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3001/student/reset-password", {
        email: forgotEmail,
        otp,
        newPassword,
      });

      alert("Password reset successful");
      setShowResetModal(false);
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-[#EEF6FB] p-8 rounded-3xl shadow-2xl w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-2">
            STUDENT LOGIN
          </h2>

          <p className="text-center text-gray-400 mb-8">
            Login to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
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
              onClick={() => setShowEmailModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-center mb-4">
              Forgot Password
            </h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <button
              onClick={sendOtp}
              className="w-full bg-[#141E46] text-white py-2 rounded"
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
              onClick={() => setShowOtpModal(false)}
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
              onClick={() => setShowResetModal(false)}
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
