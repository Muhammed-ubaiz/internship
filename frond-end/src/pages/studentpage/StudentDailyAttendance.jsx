import SideBarStudent from "./SideBarStudent";

function StudentDailyAttendance() {
  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540]">
            Daily Attendance - Rahul
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Attendance details for 20 January 2026
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm text-gray-500">Date</h3>
            <p className="text-xl font-bold text-[#0077b6]">20-01-2026</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm text-gray-500">Status</h3>
            <p className="text-xl font-bold text-green-600">Present</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm text-gray-500">Punch In</h3>
            <p className="text-xl font-bold">09:10 AM</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm text-gray-500">Punch Out</h3>
            <p className="text-xl font-bold">04:55 PM</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Log</h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[#0077b6] border-b">
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">Punch In</td>
                <td className="px-4 py-3">09:10 AM</td>
                <td className="px-4 py-3 text-green-600">On Time</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">Lunch Break</td>
                <td className="px-4 py-3">01:00 PM – 01:30 PM</td>
                <td className="px-4 py-3">Break</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Punch Out</td>
                <td className="px-4 py-3">04:55 PM</td>
                <td className="px-4 py-3 text-green-600">Completed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDailyAttendance;
