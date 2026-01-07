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
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540]">
            Monthly Attendance Summary
          </h2>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Month Filter */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-[#0077b6] font-semibold">
                <th className="px-4">Name</th>
                <th className="px-4">Total Days</th>
                <th className="px-4">Present</th>
                <th className="px-4">Leave</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="bg-[#f1f8fd]">
                  <td className="px-4 py-3 rounded-l-lg font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">{item.total}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    {item.present}
                  </td>
                  <td className="px-4 py-3 rounded-r-lg text-red-600 font-semibold">
                    {item.leave}
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

export default MonthlySummary;
