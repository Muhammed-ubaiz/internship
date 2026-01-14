import React from "react";
import Sidebar from "./sidebar";
import Topbar from "./Topbar";

/* ================= STAT CARD COMPONENT ================= */
function StatCard({ title, value, percent, percentColor, bar }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <p className="text-blue-600 text-sm">{title}</p>

      <h2 className="text-4xl font-bold mt-2 text-[#0F172A]">
        {value}
      </h2>

      <p className={`text-sm mt-1 ${percentColor}`}>
        {percent}
      </p>

      <div className={`h-10 mt-6 rounded-lg ${bar}`} />
    </div>
  );
}

/* ================= DASHBOARD ================= */
function MentorDashboard() {
  return (
    <div className="flex min-h-screen bg-[#EEF6FB]">
      
      {/* SIDEBAR */}
      <div className="w-[220px]">
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="p-6 space-y-8">
          
          {/* ====== TOP CARDS ====== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value="4"
              percent="-25% compared to January"
              percentColor="text-red-500"
              bar="bg-green-200"
            />
            <StatCard
              title="Total Courses"
              value="6"
              percent="+35% compared to January"
              percentColor="text-green-500"
              bar="bg-red-200"
            />
            <StatCard
              title="Present Students"
              value="180"
              percent="-13% compared to January"
              percentColor="text-red-500"
              bar="bg-orange-200"
            />
            <StatCard
              title="Absent Students"
              value="25"
              percent="+33% compared to January"
              percentColor="text-green-500"
              bar="bg-blue-200"
            />
          </div>

          {/* ====== BOTTOM SECTION ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CALENDAR */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                January 2026
              </h2>

              <div className="grid grid-cols-7 text-center text-sm font-medium text-blue-600">
                {["MO","TU","WE","TH","FR","SA","SU"].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3 mt-4 text-center">
                {[...Array(31)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 flex items-center justify-center rounded-full ${
                      i === 13
                        ? "bg-[#1E3A8A] text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* CLOCK */}
            <div className="bg-white rounded-3xl shadow-xl flex items-center justify-center">
              <div className="text-[90px] font-bold text-[#1E3A8A]">
                10:27
                <span className="text-2xl align-top ml-2">AM</span>
              </div>
            </div>

            {/* HOURS */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <p className="text-blue-600">
                  Total Students Working Hours
                </p>
                <h3 className="text-xl font-semibold mt-2">
                  00 Hr 00 Min 00 Sec
                </h3>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6">
                <p className="text-blue-600">
                  Total Students Break Hours
                </p>
                <h3 className="text-xl font-semibold mt-2">
                  00 Hr 00 Min 55 Sec
                </h3>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
