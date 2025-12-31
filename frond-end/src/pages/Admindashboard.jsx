import React from 'react';

function Admindashboard() {
  return (
    <div className="min-h-screen bg-[#EEF6FB] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#1679AB]">February 2023</span>
            {/* <img src="https://i.pravatar.cc/40" alt="profile" className="w-10 h-10 rounded-full" /> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Students</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">205</h2>
            <p className="text-xs mt-1 text-red-500">-25% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total courses</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">5</h2>
            <p className="text-xs mt-1 text-green-500">+35% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Present Students</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">180</h2>
            <p className="text-xs mt-1 text-red-500">-13% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
            <p className="text-sm text-[#1679AB]">Total Absent Students</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">25</h2>
            <p className="text-xs mt-1 text-green-500">+33% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]"></div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <h3 className="text-center font-semibold text-[#141E46] mb-4">February 2023</h3>
            <div className="grid grid-cols-7 text-center text-sm text-[#1679AB] mb-2">
              <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              <span className="text-[#141E46]">30</span>
              <span className="bg-[#1679AB] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto">1</span>
              <span className="text-[#141E46]">2</span>
              <span className="text-[#141E46]">3</span>
              <span className="text-[#141E46]">4</span>
              <span className="text-[#141E46]">5</span>
              <span className="text-[#141E46]">6</span>
            </div>
          </div>

          {/* Clock */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center border border-gray-200">
            <div className="w-40 h-40 rounded-full border-8 border-[#EEF6FB] flex items-center justify-center mb-4">
              <span className="text-3xl">🕒</span>
            </div>
            <p className="text-2xl font-bold text-[#141E46]">12:16 PM</p>
          </div>

          {/* Working / Break */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
              <p className="text-sm text-[#1679AB]">Total Students Working Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Mins 00 Secs</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
              <p className="text-sm text-[#1679AB]">Total Students Break Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Mins 55 Secs</p>
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

export default Admindashboard;
