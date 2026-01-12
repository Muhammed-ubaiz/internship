import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

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

  // OTP related states
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
        }
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
      setMessage("Please verify email before creating student");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addStudent",
        { name, email, password, course, batch },
        { headers: { Authorization: `Bearer ${token}`, Role: role } }
      );

      if (res.data.success) {
        setStudents([...students, res.data.student]);
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create student");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCourse("");
    setBatch("");
    setBatches([]);
    setIsVerified(false);
    setOtp("");
    setMessage("");
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  // --------------------- EDIT ---------------------
  const openEditModal = (student) => {
    setSelectedStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setBatch(student.batch);

    const selectedCourse = courses.find((c) => c._id === student.course);
    if (selectedCourse) fetchBatchesByCourse(selectedCourse.name);

    setPassword("");
    setShowEditModal(true);
    setIsVerified(true); // skip OTP for edit
    setMessage("");
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/updateStudent/${selectedStudentId}`,
        { name, email, course, batch, password },
        { headers: { Authorization: `Bearer ${token}`, Role: role } }
      );

      if (res.data.success) {
        fetchStudents();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update student");
    }
  };

  // --------------------- STATUS ---------------------
  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/student/status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}`, Role: role } }
      );

      if (res.data.success) fetchStudents();
    } catch (error) {
      console.error("Failed to toggle status", error);
      alert("Failed to update status");
    }
  };

  // --------------------- OTP ---------------------
  const sendOtp = async () => {
    if (!email) return setMessage("Enter email");

    setLoading(true);
    setMessage("Sending OTP...");

    try {
      const res = await axios.post("http://localhost:3001/admin/send-otp", {
        email,
      });
      if (res.data.success) {
        setShowOtpModal(true);
        setMessage("OTP sent! Check your email");
      } else {
        setMessage(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage("Enter OTP");

    setLoading(true);
    setMessage("Verifying OTP...");

    try {
      const res = await axios.post("http://localhost:3001/admin/verify-otp", {
        email,
        otp,
      });
      if (res.data.success) {
        setIsVerified(true);
        setShowOtpModal(false);
        setMessage("Email verified successfully!");
      } else {
        setMessage(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error verifying OTP");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6 ">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46] font-[Montserrat]">
            Students Management
          </h1>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#141E46] text-white px-6 py-2 rounded-lg"
          >
            + Create Student
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-2xl p-5 max-h-[640px] overflow-y-auto pt-0 ">


          <div className="flex flex-wrap gap-4 items-center mb-4 sticky top-0 bg-white h-20 p-5">
            {/* Search */}
            <div className="group relative w-80">
              {/* Container */}
              <div
                className="
      flex items-center bg-white rounded-full
      shadow-md
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-[1px]
      focus-within:shadow-2xl focus-within:-translate-y-[2px]
      focus-within:ring-2 focus-within:ring-[#141E46]/40
      active:scale-[0.98]
    "
              >
                {/* Input */}
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
        flex-1 px-5 py-3 text-sm
        text-gray-700 placeholder-gray-400
        bg-transparent
        outline-none
      "
                />

                {/* Search Button */}
                <button
                  className="
        relative flex items-center justify-center
        w-8 h-8 m-1
        rounded-full
        bg-[#141E46]
        transition-all duration-300 ease-out
        group-hover:scale-105
        hover:scale-110
        active:scale-95
      "
                >
                  {/* Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="
          h-4 w-4 text-white
          transition-transform duration-300
          group-hover:rotate-12
        "
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

                  {/* Ripple Effect */}
                  <span
                    className="
        absolute inset-0 rounded-full
        bg-white/20
        scale-0
        active:scale-100
        transition-transform duration-300
      "
                  />
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative w-72 group">
              {/* Animated Container */}
              <div
                className="
      flex items-center bg-white rounded-full
      shadow-md
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-[1px]
      focus-within:shadow-2xl focus-within:-translate-y-[2px]
      focus-within:ring-2 focus-within:ring-[#141E46]/40
      active:scale-[0.98]
    "
              >
                {/* Select */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
        appearance-none w-full bg-transparent
        px-5 py-3 pr-12
        text-sm text-gray-700
        rounded-full cursor-pointer
        outline-none
        transition-all duration-300
        focus:text-[#141E46]
      "
                >
                  <option value="All">All Students</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Animated Arrow */}
                <span
                  className="
        absolute right-5 text-[#141E46]
        transition-all duration-300
        group-hover:rotate-180
        group-focus-within:rotate-180
        group-active:scale-90
      "
                >
                  ▼
                </span>

                {/* Focus Glow */}
                <span
                  className="
        pointer-events-none absolute inset-0 rounded-full
        opacity-0
        group-focus-within:opacity-100
        transition-opacity duration-300
        ring-2 ring-[#141E46]/30
      "
                />
              </div>
            </div>
          </div>

          

          <table className="w-full text-sm border-separate border-spacing-y-3 ">
            <thead className=" sticky top-24 bg-white">
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
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF]  transform transition-all duration-300 hover:scale-98"
                >
                  <td className="px-3 py-3 text-center">{index + 1}</td>
                  <td className="px-4 py-3 w-50 break-all text-center">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 w-50 break-all text-center">
                    {student.email}
                  </td>
                  <td className="px-4 py-3 w-37.5 break-all text-center">
                    {courses.find((c) => c._id === student.course)?.name ||
                      "N/A"}
                  </td>
                  <td className="px-4 py-3 w-37.5 break-all text-center">
                    {student.batch || "N/A"}
                  </td>
                  <td className="px-4 py-3 w-37.5 break-all text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700 px-8"
                          : "bg-red-100 text-red-700 px-7"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3 text-center flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleToggleStatus(student._id)}
                      className={`px-5 py-1 text-xs rounded-lg text-white ${
                        student.status === "Active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700 px-6"
                      }`}
                    >
                      {student.status === "Active" ? "Inactive" : "Active"}
                    </button>

                    <button
                      onClick={() => openEditModal(student)}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
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

              {/* Email Input + Verify */}
              <div className="flex gap-2">
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
                  className={`px-4 rounded text-white ${
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
                    (c) => c._id === selectedCourseId
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
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

              <input
                type="password"
                placeholder="New Password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <select
                value={course}
                onChange={(e) => {
                  const selectedCourseId = e.target.value;
                  setCourse(selectedCourseId);
                  const selectedCourse = courses.find(
                    (c) => c._id === selectedCourseId
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-4">
              Enter OTP
            </h2>

            <p className="text-sm text-gray-600 text-center mb-4">
              OTP sent to <span className="font-semibold">{email}</span>
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
