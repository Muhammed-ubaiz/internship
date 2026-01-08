import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function StudentLogin() {
  const navigate = useNavigate();
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3001/student/checkstudent",
        { email, password }
      );

      if (res.data.success) {
        setShowOtpModal(true);
      } else {
        alert("Check your email and password");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/student/verify-otp",
        { email, otp }
      );

      if (res.data.success) {
        const { token, role } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        const decoded = jwtDecode(token);
        const timeout = decoded.exp * 1000 - Date.now();

        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/";
        }, timeout);

        navigate("/studentsdashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/student/forgot-password",
        { email: forgotEmail }
      );

      if (res.data.success) {
        alert("Password reset link sent to your email");
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">

        <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
          {showForgotPassword ? "RESET PASSWORD" : "STUDENT LOGIN"}
        </h2>

        {!showForgotPassword ? (
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"></label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-gray-400 hover:text-[#1679AB]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#141E46] text-white rounded-lg"
            >
              Login
            </button>

          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">

            <div>
              <label className="block text-[#1679AB] mb-2">Email</label>
              <input
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter Your email"
                type="email"
                value={forgotEmail}
                required
                className="w-full px-4 py-3 rounded-lg text-black border"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#141E46] text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Back to Login
            </button>

          </form>
        )}
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
            <h2 className="text-2xl font-bold text-center text-[#1679AB] mb-6">
              Verify OTP
            </h2>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-[#1679AB] mb-2">Enter OTP</label>
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  type="text"
                  value={otp}
                  maxLength="6"
                  required
                  className="w-full px-4 py-3 rounded-lg text-black border text-center text-2xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-[#141E46] text-white rounded-lg disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                }}
                className="w-full py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentLogin;
