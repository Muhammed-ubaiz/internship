import SideBarStudent from "./SideBarStudent";
import GraphSection from "../GraphSection";

function StudentMonthlySummary() {
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
                    <h2 className="text-2xl font-bold text-[#0a2540]">Monthly Summary - Rahul</h2>
                    <p className="text-sm text-gray-500 mt-1">Attendance & Leave Overview for January 2026</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
                        <h3 className="text-lg font-semibold mb-2">Total Days</h3>
                        <p className="text-3xl font-bold text-[#0077b6]">22</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
                        <h3 className="text-lg font-semibold mb-2">Present</h3>
                        <p className="text-3xl font-bold text-green-600">19</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
                        <h3 className="text-lg font-semibold mb-2">Absent / Leaves</h3>
                        <p className="text-3xl font-bold text-red-600">3</p>
                    </div>
                </div>

                {/* Graph Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <GraphSection />
                </div>

                {/* Leave Details Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
                    <table className="w-full border-collapse">
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
