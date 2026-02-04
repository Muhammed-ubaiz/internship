import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "./sidebar";

const showErrorAlert = (error) => {
  const message =
    error?.response?.data?.message || error?.message || "Something went wrong!";
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    draggable: true,
  });
};

function Mentorcreate() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH MENTORS =================
  const fetchMentors = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    try {
      const res = await axios.get("http://localhost:3001/admin/getMentors", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
      });
      if (res.data.success) setMentors(res.data.mentors);
    } catch (error) {
      showErrorAlert(error);
    }
  };

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    try {
      const res = await axios.get("http://localhost:3001/admin/getCourse", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
      });
      setCourses(res.data);
    } catch (error) {
      showErrorAlert(error);
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchCourses();
  }, []);

  // ================= RESET FORM =================
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCourse("");
    setOtp("");
    setIsVerified(false);
    setMessage("");
    setShowModal(false);
    setShowEditModal(false);
    setShowOtpModal(false);
  };

  // ================= ADD MENTOR =================
  const handleAddMentor = async (e) => {
    e.preventDefault();
    
    if (!isVerified) {
      Swal.fire({
        icon: "error",
        title: "Email not verified",
        text: "Please verify email before creating mentor",
        draggable: true,
      });
      return;
    }

    if (!course) {
      Swal.fire({
        icon: "warning",
        title: "Select Course",
        text: "Please select a course",
        draggable: true,
      });
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addMentor",
        { name, email, password, course },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        setMentors([...mentors, res.data.mentor]);
        resetForm();
        Swal.fire({
          title: "Mentor Added Successfully!",
          icon: "success",
          draggable: true,
        });
      }
    } catch (error) {
      showErrorAlert(error);
    }
  };

  // ================= EDIT MENTOR =================
  const openEditModal = (mentor) => {
    setSelectedMentorId(mentor._id);
    setName(mentor.name);
    setEmail(mentor.email);
    setCourse(mentor.course);
    setPassword("");
    setShowEditModal(true);
  };

  const handleUpdateMentor = async (e) => {
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
      if (result.isDenied) Swal.fire("Changes are not saved", "", "info");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/updateMentor/${selectedMentorId}`,
        { name, email, course },
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        fetchMentors();
        setShowEditModal(false);
        resetForm();
        Swal.fire("Saved!", "Mentor updated successfully.", "success");
      }
    } catch (error) {
      showErrorAlert(error);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.put(
        `http://localhost:3001/admin/mentor/status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}`, Role: role } },
      );

      if (res.data.success) {
        fetchMentors();

        const updatedMentor = mentors.find((m) => m._id === id);
        const newStatus = updatedMentor && updatedMentor.status === "Active"
          ? "Inactive"
          : "Active";

        Swal.fire({
          icon: "success",
          title: `Mentor is now ${newStatus}`,
          showConfirmButton: false,
          timer: 1500,
          draggable: true,
        });
      }
    } catch (error) {
      showErrorAlert(error);
    }
  };

  // ================= SEND OTP =================
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
    } catch (error) {
      showErrorAlert(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    if (!otp) {
      Swal.fire({
        icon: "error",
        title: "OTP required",
        text: "Enter OTP to verify",
        draggable: true,
      });
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

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
    } catch (error) {
      showErrorAlert(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTERED MENTORS =================
  const filteredMentors = mentors.filter((mentor) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      mentor.name.toLowerCase().includes(search) ||
      mentor.email.toLowerCase().includes(search) ||
      (mentor.course && mentor.course.toLowerCase().includes(search));
    const matchesStatus =
      statusFilter === "All" || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6">
      <Sidebar />

      <div className="lg:ml-52 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-7 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#141E46] font-[Montserrat] text-center sm:text-left">
            Mentor Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141E46] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            + Create Mentor
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl max-h-[640px] overflow-y-auto">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <input
                  type="text"
                  placeholder="Search mentors..."
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
            <div className="relative w-full sm:max-w-[280px] group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  <option value="All">All Mentors</option>
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
            {filteredMentors.length === 0 ? (
              <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
                No mentors found
              </div>
            ) : (
              filteredMentors.map((mentor, index) => (
                <div
                  key={mentor._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                      <h3 className="font-semibold text-[#141E46] mb-1">{mentor.name}</h3>
                      <p className="text-sm text-gray-600 break-all mb-1">{mentor.email}</p>
                      <p className="text-xs text-gray-500">
                        {mentor.course || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                        mentor.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {mentor.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(mentor)}
                      className="flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(mentor._id)}
                      className={`flex-1 min-w-[100px] px-3 py-2 text-xs rounded-lg text-white ${
                        mentor.status === "Active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {mentor.status === "Active" ? "Inactive" : "Active"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
              <thead className="top-18 bg-white">
                <tr className="text-[#1679AB] text-left">
                  <th className="p-3 text-center">#</th>
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">Course</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.length === 0 ? (
                  <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                    <td colSpan="6" className="text-center p-3 rounded-2xl">
                      No mentors found
                    </td>
                  </tr>
                ) : (
                  filteredMentors.map((mentor, index) => (
                    <tr
                      key={mentor._id}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                    >
                      <td className="px-3 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-center break-words">
                        {mentor.name}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {mentor.email}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {mentor.course || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            mentor.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mentor.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(mentor)}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(mentor._id)}
                            className={`px-3 py-1 text-xs rounded-lg text-white ${
                              mentor.status === "Active"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {mentor.status === "Active" ? "Inactive" : "Active"}
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
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-center mb-5">
              Create Mentor
            </h2>

            <form onSubmit={handleAddMentor} className="space-y-3">
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
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                className="w-full bg-[#141E46] text-white py-2 rounded disabled:opacity-50"
                type="submit"
                disabled={!isVerified}
              >
                Create Mentor
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
              Edit Mentor
            </h2>

            <form onSubmit={handleUpdateMentor} className="space-y-3">
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
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-[#141E46] text-white py-2 rounded hover:bg-[#0f2040]"
              >
                Update Mentor
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

export default Mentorcreate;