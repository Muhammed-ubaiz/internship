import React, { useEffect, useState } from "react";
import SideBarStudent from "./SideBarStudent";
import api from "../../utils/axiosConfig";

function StudentLeaveHistory() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    fetchLeaves();
    // Get student name from localStorage
    const student = JSON.parse(localStorage.getItem("student") || "{}");
    setStudentName(student.name || "Student");
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/student/my-leaves");

      if (response.data.success) {
        setLeaveData(response.data.leaves);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

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

      <div className="ml-0 lg:ml-64 flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0a2540]">
            Leave History - {studentName}
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Track all your applied leaves
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-6">
            Leave Application Records
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 py-4 border-b">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[600px]">
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
                    <tr key={leave._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{formatDate(leave.from)}</td>
                      <td className="px-4 py-3">{formatDate(leave.to)}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentLeaveHistory;
