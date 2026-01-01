import React from "react";

const Attendance = () => {
  return (
    <div className="min-h-screen bg-[#EEF6FB] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Attendance Management
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Days</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">25</h2>
            <div className="h-8 rounded mt-4 bg-[#D1E8FF]"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Present</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">20</h2>
            <div className="h-8 rounded mt-4 bg-[#D1F7DC]"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Absent</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">5</h2>
            <div className="h-8 rounded mt-4 bg-[#FFE7D1]"></div>
          </div>
        </div>

        {/* Attendance Request */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-[#141E46] mb-4">
            Attendance Request
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
            />

            <select className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB]">
              <option>Select Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Leave</option>
            </select>

            <input
              type="text"
              placeholder="Reason"
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
            />
          </div>

          <button className="mt-5 bg-[#141E46] text-white px-6 py-2 rounded-lg hover:bg-[#2e3656] transition">
            Submit Request
          </button>
        </div>

        {/* View Attendance */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141E46]">
              View Attendance by Date
            </h2>
            <input
              type="date"
              className="border p-2 rounded-lg mt-2 md:mt-0 focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
            />
          </div>

          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-[#D1E8FF]">
              <tr>
                <th className="p-3 border text-[#141E46]">Name</th>
                <th className="p-3 border text-[#141E46]">Date</th>
                <th className="p-3 border text-[#141E46]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center bg-white">
                <td className="p-3 border">Rahul</td>
                <td className="p-3 border">01-01-2026</td>
                <td className="p-3 border text-green-600 font-medium">
                  Present
                </td>
              </tr>
              <tr className="text-center bg-gray-50">
                <td className="p-3 border">Ayesha</td>
                <td className="p-3 border">01-01-2026</td>
                <td className="p-3 border text-red-600 font-medium">
                  Absent
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Attendance;
