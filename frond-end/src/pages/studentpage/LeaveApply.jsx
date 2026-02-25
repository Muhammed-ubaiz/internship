import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import SideBarStudent from "./SideBarStudent";
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  FileText,
  Clock
} from "lucide-react";

function LeaveApply() {
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaveStats, setLeaveStats] = useState({
    total: 2,
    used: 0,
    remaining: 2,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeaveStats();
  }, []);

  const fetchLeaveStats = async () => {
    try {
      const res = await api.get("/student/leave-count");
      setLeaveStats(res.data);
    } catch (err) {
      console.error("Error fetching leave stats:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (leaveStats.remaining <= 0) {
      alert("You have reached your monthly leave limit!");
      return;
    }

    const { leaveType, fromDate, toDate, reason } = formData;
    if (!leaveType || !fromDate || !toDate || !reason) {
      alert("All fields are required");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert("To date cannot be before from date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/student/apply-leave", {
        leaveType,
        fromDate,
        toDate,
        reason
      });

      const data = res.data;
      console.log("RESPONSE 👉 ", data);

      alert("Leave applied successfully!");
      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaveStats();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      alert(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      {/* Sidebar - Let SideBarStudent handle its own responsiveness */}
      <SideBarStudent />

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#141E46]">
              Apply for Leave
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46]">
              Apply for Leave
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Leaves</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0a2540]">
                    {leaveStats.total}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#0a2540] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 sm:mt-3">Monthly allocation</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Leaves Used</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {leaveStats.used}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors duration-300">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 sm:mt-3">This month</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Leaves Remaining</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {leaveStats.remaining}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 sm:mt-3">Available for use</p>
            </div>
          </div>

          {/* Apply Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-[#0a2540] rounded-lg group">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0a2540]">Leave Application Form</h2>
                <p className="text-xs sm:text-sm text-gray-500">Fill all fields to submit your leave request</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <p className="text-red-600 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-7">
              {/* Leave Type Input */}
              <div className="group">
                <label className="block mb-2 sm:mb-3 text-sm sm:text-base font-medium text-gray-700">
                  Leave Type
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 pr-10 sm:pr-12 text-sm sm:text-base text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
                      required
                    >
                      <option value="">Select leave type</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal Leave</option>
                      <option value="Emergency">Emergency Leave</option>
                    </select>
                    <span className="absolute right-3 sm:right-5 text-[#0a2540] text-xs sm:text-sm transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                <div className="group">
                  <label className="block mb-2 sm:mb-3 text-sm sm:text-base font-medium text-gray-700">
                    From Date
                  </label>
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base text-gray-700 outline-none appearance-none"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-2 sm:mb-3 text-sm sm:text-base font-medium text-gray-700">
                    To Date
                  </label>
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base text-gray-700 outline-none appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div className="group">
                <label className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-gray-700">
                  Reason
                </label>
                <div className="flex items-start bg-white rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="w-full bg-transparent px-4 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base text-gray-700 outline-none resize-none rounded-xl sm:rounded-2xl"
                    required
                  ></textarea>
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-5 mt-3 sm:mt-4 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Submit Button & Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 lg:gap-6 pt-2 sm:pt-3 lg:pt-4">
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-xl w-full sm:w-auto">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div className="text-xs sm:text-sm">
                    {leaveStats.remaining > 0 ? (
                      <span className="text-blue-700 font-medium">
                        <span className="text-green-600 font-bold">{leaveStats.remaining}</span> leave{leaveStats.remaining !== 1 ? 's' : ''} remaining this month
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Monthly leave limit reached
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || leaveStats.remaining <= 0}
                  className={`group relative w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 text-sm sm:text-base font-medium rounded-full shadow-2xl transition-all duration-300 ease-out flex items-center justify-center gap-2 sm:gap-3 hover:shadow-3xl hover:-translate-y-[2px] active:scale-[0.95]
                    ${leaveStats.remaining <= 0 || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0a2540] to-[#1a365d] text-white hover:from-[#1a365d] hover:to-[#0a2540]"
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <span>Apply for Leave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveApply;