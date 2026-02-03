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
    <div className="min-h-screen bg-[#EEF6FB] flex">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-6 md:ml-52">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] text-center md:text-left">
              Leave History
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center md:text-left">
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

          {/* Cards */}
          {leaves.length === 0 ? (
            <div className="flex justify-center items-center h-60 bg-white rounded-xl shadow">
              <p className="text-gray-500">
                No leave history found
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer flex flex-col justify-between transform transition-all duration-300 hover:shadow-2xl"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        Rahul
                      </h3>
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

                    <div className="mt-4 flex items-center">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getStatusStyle(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveHistory;
