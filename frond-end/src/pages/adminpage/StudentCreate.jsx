import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

function StudentCreate() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");


  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/getStudents");
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);


  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addStudent",
        { name, email, password, course, batch }
      );

      if (res.data.success) {
        setStudents([...students, res.data.student]);


        setName("");
        setEmail("");
        setPassword("");
        setCourse("");
        setBatch("");

        setShowCreateModal(false);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create student");
    }
  };

 
  const openEditModal = (student) => {
    setSelectedStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setBatch(student.batch);
    setPassword("");
    setShowEditModal(true);
  };


  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:3001/admin/updateStudent/${selectedStudentId}`,
        { name, email, course, batch }
      );

      if (res.data.success) {
        fetchStudents();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update student");
    }
  };

 
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/admin/student/status/${id}`
      );

      if (res.data.success) {
        fetchStudents();
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
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
        <div className="bg-white rounded-3xl shadow-2xl p-5">
          <table className="w-full text-sm border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[#1679AB] text-left">
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF]"
                >
                  <td className="px-3 py-3">{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.batch}</td>
                  <td>
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
                  <td className="flex gap-2 p-5">
                    
                    <button
                      onClick={() => handleToggleStatus(student._id)}
                      className={`px-3 py-1 text-xs rounded-lg text-white ${
                        student.status === "Active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {student.status === "Active"
                        ? "Inactive"
                        : "Active"}
                    </button>

                    {/* EDIT */}
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
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
              Create Student
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
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
                <option>MERN Stack</option>
                <option>React JS</option>
              </select>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Batch</option>
                <option>Batch A</option>
                <option>Batch B</option>
              </select>

              <button className="w-full bg-[#141E46] text-white py-2 rounded">
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
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
              Edit Student
            </h2>

            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
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
                <option>MERN Stack</option>
                <option>React JS</option>
              </select>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option>Batch A</option>
                <option>Batch B</option>
              </select>

              <button className="w-full bg-[#141E46] text-white py-2 rounded">
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
