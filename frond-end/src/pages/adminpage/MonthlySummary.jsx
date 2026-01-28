import React, { useState } from "react";
import Sidebar from "./sidebar";

function MonthlySummary() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [month, setMonth] = useState("2026-01");

  const data = [
    { name: "Rahul", total: 26, present: 22, leave: 2 },
    { name: "Anu", total: 26, present: 20, leave: 2 },
    { name: "Suresh", total: 26, present: 18, leave: 5 },
  ];

  const filteredData = data
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 lg:ml-52 w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#0a2540] font-[Montserrat] text-center lg:text-left mb-2">
  Monthly Attendance Summary
</h2>

        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 mb-6">
          {filteredData.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f1f8fd] p-4 rounded-xl shadow transform transition-all duration-300"
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm">Total Days: {item.total}</p>
              <p className="text-sm text-green-600 font-semibold">
                Present: {item.present}
              </p>
              <p className="text-sm text-red-600 font-semibold">
                Leave: {item.leave}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4 min-w-[600px]">
            <thead>
              <tr className="text-left text-[#0077b6] font-semibold">
                <th className="px-4">Name</th>
                <th className="px-4">Total Days</th>
                <th className="px-4">Present</th>
                <th className="px-4">Leave</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="bg-[#f1f8fd] transform transition-all duration-300 hover:scale-98"
                >
                  <td className="px-4 py-3 rounded-l-lg font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.total}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{item.present}</td>
                  <td className="px-4 py-3 rounded-r-lg text-red-600 font-semibold">{item.leave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;
