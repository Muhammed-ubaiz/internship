import { useState } from "react";
import Sidebar from "./sidebar";

function MyStudents() {
  // --------------------- DATA ---------------------
  const batches = ["MERN A", "MERN B", "Python A", "Java Fullstack"];

  const [students] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", batch: "MERN A", status: "Active" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", batch: "Python A", status: "Inactive" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", batch: "Java Fullstack", status: "Active" },
    { id: 4, name: "David Lee", email: "david@example.com", batch: "MERN B", status: "Active" },
    { id: 5, name: "Eva Green", email: "eva@example.com", batch: "Python A", status: "Inactive" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  // --------------------- FILTERED STUDENTS ---------------------
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.batch.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    const matchesBatch =
      batchFilter === "All" || student.batch === batchFilter;

    return matchesSearch && matchesStatus && matchesBatch;
  });

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46] font-[Montserrat]">
            My Students
          </h1>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-wrap gap-4 items-center mb-4 sticky top-0 bg-white h-20 p-5">
          {/* Search */}
          <div className="group relative w-80">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-5 py-2 text-sm text-gray-700 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-64 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 py-2 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
              >
                <option value="All">All Students</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute right-3 text-[#141E46]">▼</span>
            </div>
          </div>

          {/* Batch Filter */}
          <div className="relative w-64 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 py-2 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
              >
                <option value="All">All Batches</option>
                {batches.map((b, index) => (
                  <option key={index} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 text-[#141E46]">▼</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 max-h-[640px] overflow-y-auto pt-0">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[#1679AB]">
                <th className="p-2 w-10 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Batch</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300"
                >
                  <td className="px-2 py-2 text-left">{index + 1}</td>
                  <td className="px-2 py-2 break-all">{student.name}</td>
                  <td className="px-2 py-2 break-all">{student.email}</td>
                  <td className="px-2 py-2 break-all">{student.batch}</td>
                  <td className="px-2 py-2 break-all">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-gray-500 py-4 text-left">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyStudents;
