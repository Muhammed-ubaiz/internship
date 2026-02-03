import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";

function AdminLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/admin/leave-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLeaveRequests(data.leaves))
      .catch((err) =>
        console.error("Error fetching leave requests:", err)
      );
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:3001/admin/leave-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        setLeaveRequests((prev) =>
          prev.filter((l) => l._id !== id)
        );
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
    <div className="min-h-screen bg-[#EEF6FB] flex">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-6 md:ml-52">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] mb-6 text-center md:text-left">
            Leave Requests
          </h2>

          {leaveRequests.length === 0 ? (
            <div className="flex justify-center items-center h-60 bg-white rounded-xl shadow">
              <p className="text-gray-500">
                No pending leave requests
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {leaveRequests.map((leave) => (
                  <div
                    key={leave._id}
                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {leave.studentId?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {leave.studentId?.batch || "Batch A"} |{" "}
                        {leave.studentId?.email}
                      </p>
                      <p className="mt-2">Type: {leave.type}</p>
                      <p>
                        From:{" "}
                        {new Date(leave.from).toLocaleDateString()}
                      </p>
                      <p>
                        To:{" "}
                        {new Date(leave.to).toLocaleDateString()}
                      </p>
                      <p>Reason: {leave.reason}</p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              leave._id,
                              "Approved"
                            )
                          }
                          className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              leave._id,
                              "Rejected"
                            )
                          }
                          className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
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

export default AdminLeaveRequest;
