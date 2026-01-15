import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";

function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const storedLeaves =
      JSON.parse(localStorage.getItem("studentLeaves")) || [];
    setLeaves(storedLeaves);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat]">
            Leave History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Student Leave Records
          </p>
        </div>

        {/* Filters UI (no logic change) */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="p-2 border border-gray-300 rounded-lg flex-1"
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-lg"
          />
          <select className="p-2 border border-gray-300 rounded-lg">
            <option value="">Sort by Status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaves.length === 0 ? (
            <p className="text-gray-500">No leave history found</p>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl cursor-pointer flex flex-col justify-between transform transition-all duration-500 hover:scale-102"
              >
                <div>
                  <h3 className="font-semibold text-lg">Rahul</h3>
                  <p className="text-sm text-gray-500">
                    {leave.type} | Batch A
                  </p>
                  <p className="mt-2 text-gray-700">
                    From: {leave.from}
                  </p>
                  <p className="text-gray-700">
                    To: {leave.to}
                  </p>
                  <p className="text-gray-700">
                    Reason: {leave.reason}
                  </p>
                </div>

                <div className="mt-4 flex justify-start items-center">
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusStyle(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveHistory;
