import React, { useState } from "react";
import SideBarStudent from "./SideBarStudent";

function LeaveApply() {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    leaveType: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingLeaves =
      JSON.parse(localStorage.getItem("studentLeaves")) || [];

    const newLeave = {
      id: Date.now(),
      from: formData.fromDate,
      to: formData.toDate,
      type: formData.leaveType,
      reason: formData.reason,
      status: "Pending",
    };

    localStorage.setItem(
      "studentLeaves",
      JSON.stringify([...existingLeaves, newLeave])
    );

    setFormData({
      fromDate: "",
      toDate: "",
      reason: "",
      leaveType: "",
    });

    alert("Leave Applied Successfully");
  };

  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      <div className="ml-64 flex-1 p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0a2540]">
            Apply Leave - Rahul
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Submit your leave request
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-base text-gray-500">Total Leaves</h3>
            <p className="text-4xl font-bold text-[#0077b6]">20</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-base text-gray-500">Used Leaves</h3>
            <p className="text-4xl font-bold text-red-600">5</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-base text-gray-500">Remaining</h3>
            <p className="text-4xl font-bold text-green-600">15</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-4xl">
            <h3 className="text-2xl font-semibold mb-8 text-center">
              Leave Application Form
            </h3>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-base font-medium mb-2">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-5 py-3 text-base"
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-5 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-5 py-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="5"
                  className="w-full border rounded-xl px-5 py-3"
                  required
                ></textarea>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-[#0077b6] text-white px-14 py-3 text-lg rounded-xl"
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
