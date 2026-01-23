import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
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
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------- FETCH DATA ---------------------
  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get("http://localhost:3001/admin/getCourse", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchBatchesByCourse = async (courseName) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get(
        `http://localhost:3001/admin/getBatches/${courseName}`,
        {
          headers: { Authorization: `Bearer ${token}`, Role: role },
        },
      );
      setBatches(res.data.batches);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get("http://localhost:3001/admin/getStudents", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
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

  // --------------------- CREATE ---------------------
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      Swal.fire({
        icon: "error",
        title: "Email not verified",
        text: "Please verify email before creating student",
        draggable: true,
      });
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addStudent",
        { name, email, password, course, batch },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        setStudents([...students, res.data.student]);
        resetForm();

        Swal.fire({
          title: "Student Added Successfully!",
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
        footer: '<a href="#">Why do I have this issue?</a>',
        draggable: true,
      });
    }
  };

  // --------------------- UPDATE ---------------------
  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
      draggable: true,
    });

    if (!result.isConfirmed) {
      if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/updateStudent/${selectedStudentId}`,
        { name, email, course, batch, password },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
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
        footer: '<a href="#">Why do I have this issue?</a>',
        draggable: true,
      });
    }
  };

  const openEditModal = (student) => {
    setSelectedStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setBatch(student.batch);
    setShowEditModal(true);
  };

  // --------------------- STATUS TOGGLE ---------------------
  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/student/status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        fetchStudents();

        const updatedStudent = students.find((s) => s._id === id);
        const newStatus =
          updatedStudent && updatedStudent.status === "Active"
            ? "Inactive"
            : "Active";

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
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update status",
        draggable: true,
      });
    }
  };

  // --------------------- SEND OTP ---------------------
  const sendOtp = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Email required",
        text: "Enter email to send OTP",
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/send-otp",
        { email },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        setShowOtpModal(true);
        Swal.fire({
          title: "OTP Sent!",
          text: "Check your email",
          icon: "success",
          draggable: true,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: res.data.message || "Could not send OTP",
          icon: "error",
          draggable: true,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Error sending OTP",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------- VERIFY OTP ---------------------
  const verifyOtp = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!otp) {
      Swal.fire({
        icon: "error",
        title: "OTP required",
        text: "Enter OTP to verify",
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/verify-otp",
        { email, otp },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        setIsVerified(true);
        setShowOtpModal(false);

        Swal.fire({
          title: "Email Verified!",
          icon: "success",
          draggable: true,
        });
      } else {
        Swal.fire({
          title: "Invalid OTP",
          text: res.data.message || "Please try again",
          icon: "error",
          draggable: true,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Error verifying OTP",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCourse("");
    setBatch("");
    setOtp("");
    setIsVerified(false);
    setMessage("");
    setShowCreateModal(false);
    setBatches([]);
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      (student.batch && student.batch.toLowerCase().includes(search)) ||
      courses
        .find((c) => c._id === student.course)
        ?.name.toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6">
      <Sidebar />

      <div className="lg:ml-52 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#141E46] font-[Montserrat] text-center sm:text-left">
            Students Management
          </h1>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#141E46] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            + Create Student
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl p-3 sm:p-5 max-h-[640px] overflow-y-auto">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sticky top-0 bg-white py-4 z-10">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#141E46] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-72 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  <option value="All">All Students</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
                No students found
              </div>
            ) : (
              filteredStudents.map((student, index) => (
                <div
                  key={student._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                      <h3 className="font-semibold text-[#141E46] mb-1">{student.name}</h3>
                      <p className="text-sm text-gray-600 break-all mb-1">{student.email}</p>
                      <p className="text-xs text-gray-500">
                        {courses.find((c) => c._id === student.course)?.name || "N/A"} - {student.batch || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(student)}
                      className="flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(student._id)}
                      className={`flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg text-white ${
                        student.status === "Active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {student.status === "Active" ? "Inactive" : "Active"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-3">
              <thead className="sticky top-18 bg-white">
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
                  <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                    <td colSpan="7" className="text-center p-3 rounded-2xl">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                    >
                      <td className="px-3 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-center break-words">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {courses.find((c) => c._id === student.course)?.name ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {student.batch || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center">
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
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(student)}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(student._id)}
                            className={`px-3 py-1 text-xs rounded-lg text-white ${
                              student.status === "Active"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
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

      {/* ================= CREATE MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-5">
              Create Student
            </h2>

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
                    setIsVerified(false);
                  }}
                  className="flex-1 border p-2 rounded"
                  required
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  className={`px-4 py-2 rounded text-white whitespace-nowrap ${
                    isVerified
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-[#141E46] hover:bg-[#0f2040]"
                  }`}
                  disabled={isVerified || loading}
                >
                  {isVerified ? "Verified" : loading ? "Sending..." : "Verify"}
                </button>
              </div>

              {message && <p className="text-sm text-gray-600">{message}</p>}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              <select
                value={course}
                onChange={(e) => {
                  const selectedCourseId = e.target.value;
                  setCourse(selectedCourseId);
                  const selectedCourse = courses.find(
                    (c) => c._id === selectedCourseId,
                  );
                  if (selectedCourse) fetchBatchesByCourse(selectedCourse.name);
                  setBatch("");
                }}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
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
                  <option key={b._id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <button
                className="w-full bg-[#141E46] text-white py-2 rounded disabled:opacity-50"
                type="submit"
                disabled={!isVerified}
              >
                Create Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-5">
              Edit Student
            </h2>

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
                  const selectedCourse = courses.find(
                    (c) => c._id === selectedCourseId,
                  );
                  if (selectedCourse) fetchBatchesByCourse(selectedCourse.name);
                  setBatch("");
                }}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
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
                  <option key={b._id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-[#141E46] text-white py-2 rounded hover:bg-[#0f2040]"
              >
                Update Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= OTP MODAL ================= */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 sm:p-6 relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
              Enter OTP
            </h2>

            <p className="text-sm text-gray-600 text-center mb-4">
              OTP sent to <span className="font-semibold break-all">{email}</span>
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border p-2 rounded mb-4 text-center"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-[#141E46] text-white py-2 rounded hover:bg-[#0f2040]"
            >
              Verify OTP
            </button>

            {message && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCreate;