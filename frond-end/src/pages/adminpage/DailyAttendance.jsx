import React, { useState } from "react";
import Sidebar from "./sidebar";

function DailyAttendance() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const data = [
    {
      name: "Rahul",
      course: "React JS",
      batch: "Batch A",
      punchIn: "09:10",
      punchOut: "18:05",
      worked: "8h 55m",
      status: "Present",
    },
    {
      name: "Anu",
      course: "Python",
      batch: "Batch B",
      punchIn: "09:30",
      punchOut: null,
      worked: "--",
      status: "Working",
    },
    {
      name: "Suresh",
      course: "UI/UX",
      batch: "Batch C",
      punchIn: null,
      punchOut: null,
      worked: "0h",
      status: "Absent",
    },
  ];

  const filteredData = data
    .filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) &&
        (course === "All" || i.course === course) &&
        (batch === "All" || i.batch === batch) &&
        (status === "All" || i.status === status)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "punchIn")
        return (a.punchIn || "").localeCompare(b.punchIn || "");
      return 0;
    });

  return (
    <div className="flex min-h-screen bg-[#eef5f9]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="ml-64 flex-1 p-8">
        <h2 className="text-2xl font-bold text-[#0a2540] mb-1">
          Daily Attendance (Admin)
        </h2>
        <p className="text-sm text-gray-500 mb-4">Date : 2026-01-07</p>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-56"
          />

          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option>All</option>
            <option>React JS</option>
            <option>Python</option>
            <option>UI/UX</option>
          </select>

          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option>All</option>
            <option>Batch A</option>
            <option>Batch B</option>
            <option>Batch C</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option>All</option>
            <option>Present</option>
            <option>Working</option>
            <option>Absent</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="name">Sort by Name</option>
            <option value="punchIn">Sort by Punch In</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-[#0077b6] font-semibold">
                <th className="px-4">Name</th>
                <th className="px-4">Course</th>
                <th className="px-4">Batch</th>
                <th className="px-4">Punch In</th>
                <th className="px-4">Punch Out</th>
                <th className="px-4">Worked Time</th>
                <th className="px-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((i, idx) => (
                <tr key={idx} className="bg-[#f1f8fd]">
                  <td className="px-4 py-3 rounded-l-lg font-medium">
                    {i.name}
                  </td>
                  <td className="px-4 py-3">{i.course}</td>
                  <td className="px-4 py-3">{i.batch}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">
                    {i.punchIn || "--"}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">
                    {i.punchOut || "--"}
                  </td>
                  <td className="px-4 py-3">{i.worked}</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span
                      className={`px-4 py-1 text-sm rounded-full ${
                        i.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : i.status === "Working"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {i.status}
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

export default DailyAttendance;
