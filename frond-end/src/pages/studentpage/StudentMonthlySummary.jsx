import React from "react";
import SideBarStudent from "./SideBarStudent";
import GraphSection from "../GraphSection";

function StudentMonthlySummary() {
  return (
    <div className="min-h-screen bg-[#EEF6FB]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64 p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46] 
               text-center lg:text-left w-full">
  Monthly Summary
</h2>

        </div>

        {/* Stats / Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Total Days</h3>
            <p className="text-3xl font-bold text-[#0077b6]">22</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Present</h3>
            <p className="text-3xl font-bold text-green-600">19</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Absent / Leaves</h3>
            <p className="text-3xl font-bold text-red-600">3</p>
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6 overflow-x-auto">
          <GraphSection />
        </div>

        {/* Leave Details Table */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="text-left text-[#0077b6] font-semibold border-b-2 border-gray-200">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">2026-01-05</td>
                <td className="px-4 py-3">Personal work</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">Approved</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">2026-01-12</td>
                <td className="px-4 py-3">Health issue</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">Approved</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">2026-01-18</td>
                <td className="px-4 py-3">Family emergency</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">Rejected</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StudentMonthlySummary;
