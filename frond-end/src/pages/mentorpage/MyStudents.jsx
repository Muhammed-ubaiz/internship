import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  // Get unique batches
  const batches = ["All", ...new Set(students.map((s) => s.batch).filter(Boolean))];

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

  // --------------------- FETCH STUDENTS ---------------------
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

         const res = await axios.get(
        "http://localhost:3001/mentor/getStudents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );

        setStudents(res.data);
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            My Students
          </h1>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-wrap gap-4 items-center mb-4 sticky top-0 bg-white h-20 p-5 rounded-xl">
          {/* Search */}
          <div className="w-80">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-2 text-sm rounded-full shadow-md outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-full shadow-md outline-none"
            >
              <option value="All">All Students</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div className="w-64">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-full shadow-md outline-none"
            >
              <option value="All">All Batches</option>
              {batches.map((b, index) => (
                <option key={index} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 max-h-[640px] overflow-y-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[#1679AB]">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Batch</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id} // ✅ FIXED HERE
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300"
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{student.name}</td>
                  <td className="px-2 py-2">{student.email}</td>
                  <td className="px-2 py-2">{student.batch}</td>
                  <td className="px-2 py-2">
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
                  <td colSpan="5" className="text-gray-500 py-4">
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
