import React, { useState } from "react";

function LeaveManagement() {
  const TOTAL_LEAVES = 10;

  const [leaves, setLeaves] = useState([
    {
      id: 1,
      name: "Achal",
      email: "achal@gmail.com",
      course: "BSc Computer Science",
      batch: "2023–2026",
      reason: "Medical Leave",
      fromDate: "2026-01-05",
      toDate: "2026-01-06",
      status: "Pending",
    },
    {
      id: 2,
      name: "Achal",
      email: "achal@gmail.com",
      course: "BSc Computer Science",
      batch: "2023–2026",
      reason: "Personal Work",
      fromDate: "2026-01-01",
      toDate: "2026-01-01",
      status: "Approved",
    },
    {
      id: 3,
      name: "Rahul",
      email: "rahul@gmail.com",
      course: "BCA",
      batch: "2022–2025",
      reason: "Family Function",
      fromDate: "2026-01-02",
      toDate: "2026-01-04",
      status: "Approved",
    },
  ]);

  // Calculate days between dates
  const calculateDays = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff =
      (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  // Calculate remaining leave per user
  const remainingLeave = (email) => {
    const used = leaves
      .filter(
        (leave) =>
          leave.email === email &&
          leave.status === "Approved"
      )
      .reduce(
        (sum, leave) =>
          sum +
          calculateDays(leave.fromDate, leave.toDate),
        0
      );

    return TOTAL_LEAVES - used;
  };

  // Approve / Reject logic
  const updateStatus = (id, status, email, from, to) => {
    const days = calculateDays(from, to);

    if (status === "Approved" && remainingLeave(email) < days) {
      alert("Not enough leave balance");
      return;
    }

    setLeaves(
      leaves.map((leave) =>
        leave.id === id ? { ...leave, status } : leave
      )
    );
  };

  const statusStyle = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-8">
        Leave Approval Dashboard
      </h1>

      <div className="max-w-5xl mx-auto">
        {leaves.map((leave) => {
          const days = calculateDays(
            leave.fromDate,
            leave.toDate
          );

          return (
            <div
              key={leave.id}
              className="bg-white rounded-xl shadow p-5 mb-4 border-l-4 sm:border-l-8 border-indigo-500"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Leave Details */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {leave.name}
                  </h3>
                  <p className="text-sm text-gray-600 break-all">
                    {leave.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {leave.course} | Batch {leave.batch}
                  </p>

                  <p className="mt-2">
                    <strong>Reason:</strong> {leave.reason}
                  </p>

                  <p>
                    <strong>Leave Period:</strong>{" "}
                    {leave.fromDate} → {leave.toDate}
                  </p>

                  <p>
                    <strong>Total Days:</strong> {days}
                  </p>

                  <p className="mt-2 text-sm">
                    <strong>Remaining Leave:</strong>{" "}
                    <span className="font-semibold text-indigo-600">
                      {remainingLeave(leave.email)}
                    </span>
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${statusStyle(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>

                  {leave.status === "Pending" && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <button
                        onClick={() =>
                          updateStatus(
                            leave.id,
                            "Approved",
                            leave.email,
                            leave.fromDate,
                            leave.toDate
                          )
                        }
                        className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            leave.id,
                            "Rejected",
                            leave.email,
                            leave.fromDate,
                            leave.toDate
                          )
                        }
                        className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeaveManagement;
