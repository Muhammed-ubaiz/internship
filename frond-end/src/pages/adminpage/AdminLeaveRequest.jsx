import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";

function AdminLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/admin/leave-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setLeaveRequests(data.leaves))
      .catch(err => console.error("Error fetching leave requests:", err));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3001/admin/leave-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Remove approved/rejected leave from UI
        setLeaveRequests(prev => prev.filter(l => l._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update leave status");
      }
    } catch (err) {
      console.error("Error updating leave status:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] mb-4">
          Leave Requests
        </h2>

        {leaveRequests.length === 0 ? (
          <p>No pending leave requests</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveRequests.map(leave => (
              <div
                key={leave._id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all duration-500 hover:scale-102 hover:shadow-2xl"
              >
                <div>
                  <h3 className="font-semibold text-lg">{leave.studentId?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {leave.studentId?.batch || "Batch A"} | {leave.studentId?.email}
                  </p>
                  <p className="mt-2">Type: {leave.type}</p>
                  <p>From: {new Date(leave.from).toLocaleDateString()}</p>
                  <p>To: {new Date(leave.to).toLocaleDateString()}</p>
                  <p>Reason: {leave.reason}</p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                    Pending
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(leave._id, "Approved")}
                      className="px-2 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(leave._id, "Rejected")}
                      className="px-2 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLeaveRequest;
