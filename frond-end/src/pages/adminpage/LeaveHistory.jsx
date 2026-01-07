import React from "react";
import Sidebar from "./sidebar";

function LeaveHistory() {
  return (
    <div className="flex min-h-screen bg-[#eef5f9]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540]">Leave History (Admin)</h2>
          <p className="text-sm text-gray-500 mt-1">Student Leave Records</p>
        </div>

        {/* Filters/Search */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="p-2 border border-gray-300 rounded-lg flex-1"
          />
          <input 
            type="date" 
            className="p-2 border border-gray-300 rounded-lg"
          />
          <select className="p-2 border border-gray-300 rounded-lg">
            <option value="">Sort by Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg">Rahul</h3>
              <p className="text-sm text-gray-500">React JS | Batch A</p>
              <p className="mt-2 text-gray-700">Date: 2026-01-10</p>
              <p className="text-gray-700">Reason: Personal work</p>
              <p className="text-gray-700 mt-1">Total Leaves: 3 days</p>
            </div>
            <div className="mt-4 flex justify-start items-center">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                Approved
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg">Anu</h3>
              <p className="text-sm text-gray-500">Python | Batch B</p>
              <p className="mt-2 text-gray-700">Date: 2026-01-12</p>
              <p className="text-gray-700">Reason: Health issue</p>
              <p className="text-gray-700 mt-1">Total Leaves: 2 days</p>
            </div>
            <div className="mt-4 flex justify-start items-center">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
                Rejected
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg">Suresh</h3>
              <p className="text-sm text-gray-500">UI/UX | Batch C</p>
              <p className="mt-2 text-gray-700">Date: 2026-01-15</p>
              <p className="text-gray-700">Reason: Family emergency</p>
              <p className="text-gray-700 mt-1">Total Leaves: 1 day</p>
            </div>
            <div className="mt-4 flex justify-start items-center">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                Approved
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default LeaveHistory;
    