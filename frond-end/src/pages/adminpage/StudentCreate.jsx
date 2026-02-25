import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
import Swal from "sweetalert2";

function StudentCreate() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");

  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    const role = localStorage.getItem("role");
    try {
      const res = await api.get("/admin/getCourse", {
        headers: { Role: role },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchBatchesByCourse = async (courseName) => {
    const role = localStorage.getItem("role");
    try {
      const res = await api.get(`/admin/getBatches/${courseName}`, {
        headers: { Role: role },
      });
      setBatches(res.data.batches);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const fetchStudents = async () => {
    const role = localStorage.getItem("role");
    try {
      const res = await api.get("/admin/getStudents", {
        headers: { Role: role },
      });
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // ─── Send Password Link ───────────────────────────────────────
  const sendPasswordLink = async () => {
    const role = localStorage.getItem("role");

    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Email required",
        text: "Enter email to send password setup link",
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/admin/send-password-link",
        { email },
        { headers: { Role: role } }
      );

      if (res.data.success) {
        setLinkSent(true);
        Swal.fire({
          title: "Link Sent!",
          text: "Password setup link has been sent to the email",
          icon: "success",
          draggable: true,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: res.data.message || "Could not send link",
          icon: "error",
          draggable: true,
        });
      }
    } catch (err) {
      console.error("sendPasswordLink error:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Error sending password link",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Add Student ─────────────────────────────────────────────
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const role = localStorage.getItem("role");

    try {
      const res = await api.post(
        "/admin/addStudent",
        { name, email, course, batch, password: "TEMP_PASSWORD" },
        { headers: { Role: role } }
      );

      if (res.data.success) {
        setStudents((prev) => [...prev, res.data.student]);

        // Auto-send password link if not already sent
        if (!linkSent) {
          try {
            await api.post(
              "/admin/send-password-link",
              { email },
              { headers: { Role: role } }
            );
          } catch (linkErr) {
            console.error("Failed to send password link:", linkErr);
          }
        }

        resetForm();

        Swal.fire({
          title: "Student Added Successfully!",
          html: "Password setup link has been sent to the student's email.",
          icon: "success",
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to create student",
        draggable: true,
      });
    }
  };

  // ─── Update Student ──────────────────────────────────────────
  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: "Don't save",
      draggable: true,
    });

    if (!result.isConfirmed) {
      if (result.isDenied) Swal.fire("Changes are not saved", "", "info");
      return;
    }

    const role = localStorage.getItem("role");

    try {
      const res = await api.put(
        `/admin/updateStudent/${selectedStudentId}`,
        { name, email, course, batch },
        { headers: { Role: role } }
      );

      if (res.data.success) {
        fetchStudents();
        setShowEditModal(false);
        Swal.fire("Saved!", "Student updated successfully.", "success");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to update student",
        draggable: true,
      });
    }
  };

  // ─── Toggle Status ───────────────────────────────────────────
  const handleToggleStatus = async (id) => {
    const role = localStorage.getItem("role");

    try {
      const res = await api.put(
        `/admin/student/status/${id}`,
        {},
        { headers: { Role: role } }
      );

      if (res.data.success) {
        fetchStudents();
        const updatedStudent = students.find((s) => s._id === id);
        const newStatus =
          updatedStudent?.status === "Active" ? "Inactive" : "Active";
        Swal.fire({
          icon: "success",
          title: `Student is now ${newStatus}`,
          showConfirmButton: false,
          timer: 1500,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to update status", draggable: true });
    }
  };

  const openEditModal = (student) => {
    setSelectedStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setBatch(student.batch);
    fetchBatchesByCourse(
      courses.find((c) => c._id === student.course)?.name || ""
    );
    setShowEditModal(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setCourse("");
    setBatch("");
    setLinkSent(false);
    setLoading(false);
    setShowCreateModal(false);
    setBatches([]);
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      (student.batch && student.batch.toLowerCase().includes(search)) ||
      courses.find((c) => c._id === student.course)?.name.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6 pt-14 lg:pt-4">
      <Sidebar />

      <div className="ml-0 lg:ml-52 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-7 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#141E46] font-[Montserrat] text-center sm:text-left w-full sm:w-auto">
            Students Management
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#141E46] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            + Create Student
          </button>
        </div>

        <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl max-h-[640px] overflow-y-auto">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
            <div className="group relative w-full sm:w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <button className="flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#141E46]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative w-full sm:max-w-[280px] group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                >
                  <option value="All">All Students</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="absolute right-5 text-[#141E46]">▼</span>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-3 p-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">No students found</div>
            ) : (
              filteredStudents.map((student, index) => (
                <div key={student._id} className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                      <h3 className="font-semibold text-[#141E46] mb-1">{student.name}</h3>
                      <p className="text-sm text-gray-600 break-all mb-1">{student.email}</p>
                      <p className="text-xs text-gray-500">
                        {courses.find((c) => c._id === student.course)?.name || "N/A"} - {student.batch || "N/A"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEditModal(student)} className="flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Edit</button>
                    <button onClick={() => handleToggleStatus(student._id)} className={`flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg text-white ${student.status === "Active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                      {student.status === "Active" ? "Inactive" : "Active"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
              <thead>
                <tr className="text-[#1679AB] text-left">
                  <th className="p-3 text-center">#</th>
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">Course</th>
                  <th className="p-3 text-center">Batch</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr className="bg-[#EEF6FB]">
                    <td colSpan="7" className="text-center p-3 rounded-2xl">No students found</td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student._id} className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300">
                      <td className="px-3 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-center break-words">{student.name}</td>
                      <td className="px-4 py-3 text-center break-words">{student.email}</td>
                      <td className="px-4 py-3 text-center break-words">
                        {courses.find((c) => c._id === student.course)?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center break-words">{student.batch || "N/A"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs ${student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button onClick={() => openEditModal(student)} className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Edit</button>
                          <button onClick={() => handleToggleStatus(student._id)} className={`px-3 py-1 text-xs rounded-lg text-white ${student.status === "Active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                            {student.status === "Active" ? "Inactive" : "Active"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Create Modal ─────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">✕</button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-5">Create Student</h2>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLinkSent(false);
                  }}
                  className="flex-1 border p-2 rounded"
                  required
                />
                <button
                  type="button"
                  onClick={sendPasswordLink}
                  disabled={linkSent || loading}
                  className={`px-4 py-2 rounded text-white whitespace-nowrap ${
                    linkSent
                      ? "bg-green-500 cursor-not-allowed"
                      : loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#141E46] hover:bg-[#0f2040]"
                  }`}
                >
                  {linkSent ? "✓ Sent" : loading ? "Sending..." : "Send Link"}
                </button>
              </div>

              {linkSent && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Password setup link sent to email
                </p>
              )}

              <select
                value={course}
                onChange={(e) => {
                  const selectedCourseId = e.target.value;
                  setCourse(selectedCourseId);
                  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
                  if (selectedCourse) fetchBatchesByCourse(selectedCourse.name);
                  setBatch("");
                }}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!linkSent}
                className="w-full bg-[#141E46] text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0f2040]"
              >
                Create Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">✕</button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-5">Edit Student</h2>

            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <select
                value={course}
                onChange={(e) => {
                  const selectedCourseId = e.target.value;
                  setCourse(selectedCourseId);
                  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
                  if (selectedCourse) fetchBatchesByCourse(selectedCourse.name);
                  setBatch("");
                }}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-[#141E46] text-white py-2 rounded hover:bg-[#0f2040]">
                Update Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCreate;