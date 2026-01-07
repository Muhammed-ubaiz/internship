import React from "react";
import SideBarStudent from "./SideBarStudent";

function DailyAttendance() {
  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540]">
            Daily Attendance
          </h2>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4">
              
              <thead>
                <tr className="text-left text-[#0077b6] font-semibold">
                  <th className="px-4">Name</th>
                  <th className="px-4">Date</th>
                  <th className="px-4">Punch In</th>
                  <th className="px-4">Punch Out</th>
                  <th className="px-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {/* Row 1 */}
                <tr className="bg-[#f1f8fd]">
                  <td className="px-4 py-3 rounded-l-lg font-medium">
                    Rahul
                  </td>
                  <td className="px-4 py-3">2026-01-07</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    09:10 AM
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">
                    06:05 PM
                  </td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span className="px-4 py-1 text-sm rounded-full bg-green-100 text-green-700">
                      Present
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="bg-[#f1f8fd]">
                  <td className="px-4 py-3 rounded-l-lg font-medium">
                    Anu
                  </td>
                  <td className="px-4 py-3">2026-01-07</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    09:30 AM
                  </td>
                  <td className="px-4 py-3 text-gray-400">--</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span className="px-4 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                      Working
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="bg-[#f1f8fd]">
                  <td className="px-4 py-3 rounded-l-lg font-medium">
                    Suresh
                  </td>
                  <td className="px-4 py-3">2026-01-07</td>
                  <td className="px-4 py-3 text-gray-400">--</td>
                  <td className="px-4 py-3 text-gray-400">--</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span className="px-4 py-1 text-sm rounded-full bg-red-100 text-red-700">
                      Absent
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DailyAttendance;
