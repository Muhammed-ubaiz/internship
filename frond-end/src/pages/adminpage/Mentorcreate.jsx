import axios from "axios";
import Sidebar from "./sidebar";
import React, { useState, useEffect } from "react";

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
    try {
      const res = await axios.get("http://localhost:3001/admin/getMentors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) setMentors(res.data.mentors);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
  try {
    const res = await axios.get("http://localhost:3001/admin/getCourse", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setCourses(res.data);
  } catch (error) {
    console.error(error);
  }
};

 useEffect(() => {
  fetchMentors();
  fetchCourses(); 
}, []);

  // ================= ADD MENTOR =================
  const handleAddMentor = async (e) => {
    e.preventDefault();
    if (!course) return alert("Please select course");

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addMentor",
        { name, email, password, course },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setMentors([...mentors, res.data.mentor]);
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
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
  try {
    const res = await axios.put(
      `http://localhost:3001/admin/updateMentor/${selectedMentorId}`,
      { name, email, course },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    if (res.data.success) {
      fetchMentors();
      setShowEditModal(false);
      resetForm();
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Failed to update mentor");
  }
};

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/admin/mentor/status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) fetchMentors();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  
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

  const sendOtp = async () => {
  if (!email) return setMessage("Enter email");

  setLoading(true);
  setMessage("Sending OTP...");

  try {
    const res = await axios.post(
      "http://localhost:3001/admin/send-otp",
      { email }
    );

    if (res.data.success) {
      setShowOtpModal(true);
      setMessage("OTP sent! Check your email.");
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
    const res = await axios.post(
      "http://localhost:3001/admin/verify-otp",
      { email, otp }
    );

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

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46] font-[Montserrat]">
            Mentor Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141E46] text-white px-6 py-2 rounded-lg"
          >
            + Create Mentor
          </button>
        </div>

        {/* TABLE + SEARCH + FILTER */}
        <div className="bg-white rounded-3xl shadow-2xl p-5 max-h-[640px] overflow-y-auto pt-0 ">
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-4 items-center mb-4 sticky top-0 bg-white h-20 p-5">
            <div className="group relative w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 hover:shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
        flex-1 px-5 py-3 text-sm
        text-gray-700 placeholder-gray-400
        bg-transparent
        outline-none
      "
                />
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

            <div className="relative w-72 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 hover:shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#141E46]/40">
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
                  <option value="All">All Mentors</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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

          {/* TABLE */}
          <table className="w-full text-sm border-separate border-spacing-y-3 ">
            <thead className="sticky top-24 bg-white">
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
                    <td className="px-4 py-3 w-50 break-all text-center">
                      {mentor.name}
                    </td>
                    <td className="px-4 py-3 w-50 break-all text-center">
                      {mentor.email}
                    </td>
                    <td className="px-4 py-3 w-37.5 break-all text-center">
                      {mentor.course || "N/A"}
                    </td>
                    <td className="px-4 py-3 w-37.5 break-all text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          mentor.status === "Active"
                            ? "bg-green-100 text-green-700 px-8"
                            : "bg-red-100 text-red-700 px-7"
                        }`}
                      >
                        {mentor.status || "Active"}
                      </span>
                    </td>
                    <td className="p-3 text-center flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleToggleStatus(mentor._id)}
                        className={`px-5 py-1 text-xs rounded-lg text-white ${
                          mentor.status === "Active"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700 px-6"
                        }`}
                      >
                        {mentor.status === "Active" ? "Inactive" : "Active"}
                      </button>

                      <button
                        onClick={() => openEditModal(mentor)}
                        className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
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
  onChange={(e) => setCourse(e.target.value)}
  className="w-full border p-2 rounded "
  required
>
  <option value="">Select course</option>
  {courses.map((c) => (
    <option key={c._id} value={c.name}>
      {c.name}
    </option>
  ))}
</select>


             <button
  className="w-full bg-[#141E46] text-white py-2 rounded disabled:opacity-50"
  type="submit"
  disabled={!isVerified || !course}
>
  Create Mentor
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
  <option value="">Select course</option>
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
        <p className="text-sm text-gray-600 mt-2 text-center">{message}</p>
      )}
    </div>
  </div>
)}
    </div>
  );
}




export default Mentorcreate;
