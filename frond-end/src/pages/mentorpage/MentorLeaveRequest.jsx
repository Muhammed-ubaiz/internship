import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";

function MentorLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const allLeaves =
      JSON.parse(localStorage.getItem("studentLeaves")) || [];

    // ONLY pending leaves show to mentor
    const pendingLeaves = allLeaves.filter(
      (leave) => leave.status === "Pending"
    );

    setLeaveRequests(pendingLeaves);
  }, []);

  const handleStatusChange = (id, status) => {
    const allLeaves =
      JSON.parse(localStorage.getItem("studentLeaves")) || [];

    const updatedLeaves = allLeaves.map((leave) =>
      leave.id === id ? { ...leave, status } : leave
    );

    localStorage.setItem("studentLeaves", JSON.stringify(updatedLeaves));

    // remove card after approve / reject
    setLeaveRequests((prev) =>
      prev.filter((leave) => leave.id !== id)
    );
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
            Student Leave Approval by Mentor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveRequests.length === 0 ? (
            <p className="text-gray-500">No pending leave requests</p>
          ) : (
            leaveRequests.map((leave) => (
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

                <div className="mt-4 flex justify-between items-center">
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                    Pending
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusChange(leave.id, "Approved")
                      }
                      className="px-2 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(leave.id, "Rejected")
                      }
                      className="px-2 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorLeaveRequest;
