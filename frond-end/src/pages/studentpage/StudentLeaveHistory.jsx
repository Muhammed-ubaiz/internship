import React, { useEffect, useState } from "react";
import SideBarStudent from "./SideBarStudent";

function StudentLeaveHistory() {
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    const storedLeaves =
      JSON.parse(localStorage.getItem("studentLeaves")) || [];
    setLeaveData(storedLeaves);
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
    <div className="flex min-h-screen bg-[#eef5f9]">
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      <div className="ml-64 flex-1 p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0a2540]">
            Leave History - Rahul
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Track all your applied leaves
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-6">
            Leave Application Records
          </h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[#0077b6] border-b-2">
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {leaveData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No leave records found
                  </td>
                </tr>
              ) : (
                leaveData.map((leave) => (
                  <tr key={leave.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{leave.from}</td>
                    <td className="px-4 py-3">{leave.to}</td>
                    <td className="px-4 py-3">{leave.type}</td>
                    <td className="px-4 py-3">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentLeaveHistory;
