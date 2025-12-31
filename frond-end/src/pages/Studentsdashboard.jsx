import React from "react";
import LiveClockUpdate from "./LiveClockUpdate";
import DashboardCalendar from "./Dashboardcalender";

function Studentsdashboard() {
  return (
    <div className="min-h-screen bg-[#EEF6FB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">On Time Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">65%</h2>
            <p className="text-xs mt-1 text-red-500">
              -25% compared to January
            </p>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <p className="text-xs mt-1 text-green-500">
              +35% compared to January
            </p>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              00h 40m 55s
            </h2>
            <p className="text-xs mt-1 text-red-500">
              -13% compared to January
            </p>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              00h 40m 55s
            </h2>
            <p className="text-xs mt-1 text-green-500">
              +33% compared to January
            </p>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]"></div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
         
          <DashboardCalendar/>
          

          {/* Clock */}
          <div className="w-full h-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex justify-center items-center">
            <LiveClockUpdate />
          </div>

          {/* Working / Break */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
              <p className="text-sm text-[#1679AB]">Working Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                00 Hr 00 Mins 00 Secs
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
              <p className="text-sm text-[#1679AB]">Break Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                00 Hr 00 Mins 55 Secs
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 text-center text-[#1679AB] italic border border-gray-200">
              “Punctuality is the virtue of the bored.”
            </div>

            <button className="w-full bg-[#141E46] hover:bg-[#2e3656] text-white py-3 rounded-lg font-semibold">
              Punch In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentsdashboard;
