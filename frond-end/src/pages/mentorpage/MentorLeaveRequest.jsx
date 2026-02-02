import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";

function MentorLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch pending leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        "http://localhost:3001/mentor/leave-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Approve / Reject leave
  const handleStatusChange = async (id, action) => {
    try {
      const res = await fetch(
        `http://localhost:3001/mentor/leave-requests/${id}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setLeaveRequests((prev) =>
          prev.filter((leave) => leave._id !== id)
        );
        alert(`Leave ${action} successfully`);
      } else {
        alert(data.message || "Failed to update leave");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat]">
            Leave Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mentor Leave Approval - Your Course Students Only
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2540]"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        {/* Leave Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveRequests.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  No pending leave requests from your students
                </p>
              </div>
            ) : (
              leaveRequests.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl flex flex-col justify-between transition-all duration-500 hover:scale-102"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-[#0a2540]">
                      {leave.studentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {leave.leaveType} | {leave.batch || "Batch A"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {leave.studentEmail}
                    </p>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>From:</strong> {leave.fromDate}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>To:</strong> {leave.toDate}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Reason:</strong> {leave.reason}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Pending
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(leave._id, "approved")
                        }
                        className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(leave._id, "rejected")
                        }
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorLeaveRequest;
