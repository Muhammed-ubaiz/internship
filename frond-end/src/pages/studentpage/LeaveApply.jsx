import React, { useState, useEffect } from "react";
import SideBarStudent from "./SideBarStudent";

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

    try {
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
        alert(data.message || "Failed to apply leave");
      } else {
        alert("Leave applied successfully");
        setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
        fetchLeaveStats();
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      <div className="hidden lg:block lg:w-[220px]"><SideBarStudent /></div>
      <div className="lg:hidden"><SideBarStudent /></div>

      <div className="flex-1 w-full lg:ml-0 p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-xl font-bold text-[#0a2540] mb-6 font-[Montserrat] text-center lg:text-left">
            Apply Leave
          </h2>

          {/* Leave Stats */}
          <div className="flex items-center bg-white rounded-xl shadow-md mb-6 p-7 gap-6">
            <span className="flex justify-center items-center bg-[#0a2540]/90 text-white px-4 py-2 rounded-xl gap-2">
              <strong>Total:</strong> {leaveStats.total}
            </span>
            <span className="flex justify-center items-center bg-[#0a2540]/90 text-white px-4 py-2 rounded-xl gap-2">
              <strong>Used:</strong> {leaveStats.used}
            </span>
            <span className="flex justify-center items-center bg-[#0a2540]/90 text-white px-4 py-2 rounded-xl gap-2">
              <strong>Remaining:</strong> {leaveStats.remaining}
            </span>
          </div>

          {/* Leave Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
            <h3 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center font-[Montserrat]">
              Leave Application Form
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="w-full bg-gray-100/30 rounded-full px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base outline-none cursor-pointer"
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block mb-2 font-medium text-sm sm:text-base">From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    className="w-full bg-gray-100/30 rounded-full px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm sm:text-base">To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    className="w-full bg-gray-100/30 rounded-full px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm sm:text-base">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter reason for leave..."
                  className="w-full bg-gray-100/30 rounded-xl px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-start pt-4">
                <button
                  type="submit"
                  disabled={leaveStats.remaining <= 0}
                  className={`bg-[#0a2540]/90 text-white px-8 sm:px-12 py-2.5 sm:py-3 text-base sm:text-lg rounded-xl shadow-lg 
                    hover:bg-[#13314d]/90 transition-all duration-300 w-full sm:w-auto
                    ${leaveStats.remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Apply Leave
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
