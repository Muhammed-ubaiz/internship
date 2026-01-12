import React from "react";
import Sidebar from "./sidebar";

function AdminLeaveRequest() {
  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6 ">
      
      
        <Sidebar />
      

      {/* Main Content */}
      <div className="ml-52 p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat]">
            Leave Requests 
          </h2>
          <p className="text-sm text-gray-500 mt-1">Student Leave Approval</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl  cursor-pointer flex flex-col justify-between  transform transition-all duration-500 hover:scale-102">
            <div >
              <h3 className="font-semibold text-lg">Rahul</h3>
              <p className="text-sm text-gray-500">React JS | Batch A</p>
              <p className="mt-2 text-gray-700">Date: 2026-01-10</p>
              <p className="text-gray-700">Reason: Personal work</p>
              <p className="text-gray-700 mt-1">Total Leaves Requests 3 days</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              {/* Status on left */}
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                Pending
              </span>

              {/* Buttons on right, smaller spacing */}
              <div className="flex gap-2">
                <button className="px-2 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                  Approve
                </button>
                <button className="px-2 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl  cursor-pointer flex flex-col justify-between  transform transition-all duration-500 hover:scale-102">
            <div>
              <h3 className="font-semibold text-lg">Anu</h3>
              <p className="text-sm text-gray-500">Python | Batch B</p>
              <p className="mt-2 text-gray-700">Date: 2026-01-12</p>
              <p className="text-gray-700">Reason: Health issue</p>
              <p className="text-gray-700 mt-1">Total Leaves Requests: 2 days</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                Pending
              </span>

              <div className="flex gap-2">
                <button className="px-2 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                  Approve
                </button>
                <button className="px-2 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLeaveRequest;
 