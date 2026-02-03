import React, { useState, useEffect } from "react";
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
      const res = await fetch("http://localhost:3001/student/leave-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveStats(data);
      }
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

      const res = await fetch("http://localhost:3001/student/apply-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveType, fromDate, toDate, reason }),
      });

      const data = await res.json();
      console.log("RESPONSE 👉 ", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to apply leave");
      } else {
        alert("Leave applied successfully!");
        setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
        fetchLeaveStats();
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      alert(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Sidebar - Fixed position */}
        <div className="fixed left-0 top-0 h-screen z-50">
          <SideBarStudent />
        </div>

        {/* Main Content - Adjusted for sidebar */}
        <div className="flex-1 ml-0 lg:ml-64 p-4 md:p-6 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-4">
           
            
            <div className="flex flex-col md:flex-row md:items-center justify-between ">
              <div>
                <h1 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] mb-1">
                  Apply for Leave
                </h1>
                
              </div>
            
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Leaves</p>
                  <p className="text-3xl font-bold text-[#0a2540]">
                    {leaveStats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6 text-[#0a2540] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Monthly allocation</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Leaves Used</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {leaveStats.used}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors duration-300">
                  <TrendingDown className="w-6 h-6 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">This month</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Leaves Remaining</p>
                  <p className="text-3xl font-bold text-green-600">
                    {leaveStats.remaining}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                  <UserCheck className="w-6 h-6 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Available for use</p>
            </div>
          </div>

          {/* Apply Form */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#0a2540] rounded-lg group">
                <Calendar className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0a2540]">Leave Application Form</h2>
                <p className="text-sm text-gray-500">Fill all fields to submit your leave request</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Leave Type Input */}
              <div className="group">
                <label className="block mb-3 font-medium text-gray-700">
                  Leave Type 
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      className="appearance-none w-full bg-transparent px-5 py-3.5 pr-12 text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
                      required
                    >
                      <option value="">Select leave type</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal Leave</option>
                      <option value="Emergency">Emergency Leave</option>
                     
                    </select>
                    <span className="absolute right-5 text-[#0a2540] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block mb-3 font-medium text-gray-700">
                    From Date 
                  </label>
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleChange}
                      className="w-full bg-transparent px-5 py-3.5 text-gray-700 outline-none appearance-none"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block mb-3 font-medium text-gray-700">
                    To Date 
                  </label>
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleChange}
                      className="w-full bg-transparent px-5 py-3.5 text-gray-700 outline-none appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div className="group">
                <label className="block mb-1 font-medium text-gray-700">
                  Reason 
                </label>
                <div className="flex items-start bg-white rounded-2xl shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="w-full bg-transparent px-5 py-3.5 text-gray-700 outline-none resize-none rounded-2xl"
                    required
                  ></textarea>
                  <FileText className="w-5 h-5 mr-5 mt-4 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Submit Button & Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="text-sm">
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
                  className={`group relative px-10 py-4 text-base font-medium rounded-full shadow-2xl transition-all duration-300 ease-out flex items-center justify-center gap-3 hover:shadow-3xl hover:-translate-y-[2px] active:scale-[0.95]
                    ${leaveStats.remaining <= 0 || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0a2540] to-[#1a365d] text-white hover:from-[#1a365d] hover:to-[#0a2540]"
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <span>Apply for Leave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Information Box */}
          
        </div>
      </div>
    </div>
  );
}

// Custom Icon Components
const RefreshCw = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
    />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

export default LeaveApply;