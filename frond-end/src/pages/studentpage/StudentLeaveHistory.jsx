import SideBarStudent from "./SideBarStudent";

function StudentLeaveHistory() {
  const leaveData = [
    {
      id: 1,
      from: "2026-01-05",
      to: "2026-01-05",
      type: "Personal",
      reason: "Personal work",
      status: "Approved",
    },
    {
      id: 2,
      from: "2026-01-12",
      to: "2026-01-13",
      type: "Sick",
      reason: "Fever & cold",
      status: "Approved",
    },
    {
      id: 3,
      from: "2026-01-18",
      to: "2026-01-18",
      type: "Emergency",
      reason: "Family emergency",
      status: "Rejected",
    },
    {
      id: 4,
      from: "2026-01-22",
      to: "2026-01-23",
      type: "Personal",
      reason: "Function",
      status: "Pending",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0a2540]">
            Leave History - Rahul
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Track all your applied leaves
          </p>
        </div>

        {/* Leave Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-sm text-gray-500">Total Leaves</h3>
            <p className="text-4xl font-bold text-[#0077b6]">20</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-sm text-gray-500">Approved</h3>
            <p className="text-4xl font-bold text-green-600">12</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-sm text-gray-500">Rejected</h3>
            <p className="text-4xl font-bold text-red-600">3</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h3 className="text-sm text-gray-500">Pending</h3>
            <p className="text-4xl font-bold text-yellow-600">5</p>
          </div>
        </div>

        {/* Leave History Table */}
        <div className="bg-white rounded-3xl shadow-xl p-8 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-6">
            Leave Application Records
          </h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[#0077b6] border-b-2">
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {leaveData.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{leave.from}</td>
                  <td className="px-4 py-3">{leave.to}</td>
                  <td className="px-4 py-3">{leave.type}</td>
                  <td className="px-4 py-3">{leave.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentLeaveHistory;
