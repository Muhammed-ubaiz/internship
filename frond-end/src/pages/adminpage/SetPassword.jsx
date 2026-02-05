import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token || !email) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "This password reset link is invalid",
      });
      setVerifying(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/verify-reset-token",
        { email, token }
      );

      if (res.data.success) {
        setTokenValid(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Link Expired",
          text: res.data.message || "This link has expired",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to verify link",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/set-password",
        { email, password }
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Password Set Successfully!",
          text: "You can now login with your new password",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data.message || "Failed to set password",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to set password",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#141E46] to-[#1679AB] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#141E46] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#141E46] to-[#1679AB] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#141E46] text-white rounded-lg hover:bg-[#0f2040]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141E46] to-[#1679AB] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#141E46]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Your Password</h2>
          <p className="text-gray-600 text-sm">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141E46] focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#141E46] focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              • Password must be at least 6 characters long<br/>
              • Use a combination of letters and numbers<br/>
              • Avoid common passwords
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141E46] text-white py-3 rounded-lg font-semibold hover:bg-[#0f2040] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetPassword;