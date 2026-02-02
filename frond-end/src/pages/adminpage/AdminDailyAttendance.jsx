import React, { useState } from "react";
import Sidebar from "./sidebar";

function AdminDailyAttendance() {
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
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 lg:ml-52 w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] mb-1 text-center lg:text-left">
            Daily Attendance
          </h2>
          <p className="text-sm text-gray-500 text-center lg:text-left">
            Date: 2026-01-07
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full text-sm"
          />

          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full text-sm"
          >
            <option>All</option>
            <option>React JS</option>
            <option>Python</option>
            <option>UI/UX</option>
          </select>

          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full text-sm"
          >
            <option>All</option>
            <option>Batch A</option>
            <option>Batch B</option>
            <option>Batch C</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full text-sm"
          >
            <option>All</option>
            <option>Present</option>
            <option>Working</option>
            <option>Absent</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="punchIn">Sort by Punch In</option>
          </select>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden space-y-3 mb-6">
          {filteredData.map((i, idx) => (
            <div
              key={idx}
              className="bg-[#f1f8fd] p-4 rounded-xl shadow transform transition-all duration-300"
            >
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm">Course: {i.course}</p>
              <p className="text-sm">Batch: {i.batch}</p>
              <p className="text-sm text-green-600 font-semibold">
                Punch In: {i.punchIn || "--"}
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                Punch Out: {i.punchOut || "--"}
              </p>
              <p className="text-sm">Worked: {i.worked}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                  i.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : i.status === "Working"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {i.status}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4 min-w-[700px]">
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
                <tr
                  key={idx}
                  className="bg-[#f1f8fd] transform transition-all duration-300 hover:scale-98"
                >
                  <td className="px-4 py-3 rounded-l-lg font-medium">{i.name}</td>
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

export default AdminDailyAttendance;
