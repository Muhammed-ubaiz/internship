import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

function StudentCreate() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [students, setStudents] = useState([]);
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  course: "MERN Stack",
  batch: "Batch A",
});

const fetchStudents = async () => {
  try {
    const res = await axios.get("http://localhost:3001/admin/getStudents");
    setStudents(res.data);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchStudents();
}, []);


 const handleAddStudent = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:3001/admin/addStudent", formData);

    if (res.data.success) {
      setStudents([...students, res.data.student]);
      setFormData({ name: "", email: "", password: "", course: "MERN Stack", batch: "Batch A" });
      setShowCreateModal(false);
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Failed to create student");
  }
};


  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-37 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Students Management
          </h1>
          <input
            type="search"
            placeholder="Search Student..."
            className="w-94 border rounded-lg px-3 py-2 mt-1 "
          />
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
    <tr key={student._id} className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
      <td className="px-3 py-3">{index + 1}</td>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>{student.course}</td>
      <td>{student.batch}</td>
      <td>
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {student.status}
        </span>
      </td>
      <td className="flex gap-2 p-5">
        <button
          className={`px-3 py-1 text-xs rounded-lg ${
            student.status === "Active" ? "bg-red-600" : "bg-green-600"
          } text-white`}
        >
          {student.status === "Active" ? "Inactive" : "Active"}
        </button>
        <button
          onClick={() => {
            setShowEditModal(true);
            setFormData({ ...student, password: "" });
          }}
          className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
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

      {/* CREATE MODAL — PLACEHOLDER ADDED */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center text-[#141E46] mb-5">
              Create Student
            </h2>

            <div className="space-y-4">
              <form onSubmit={handleAddStudent} className="space-y-4">
  <input
    name="name"
    placeholder="Enter name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
  />
  <input
    name="email"
    placeholder="Enter email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
  />
  <input
    name="password"
    type="password"
    placeholder="Enter password"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
  />
  <select
    name="course"
    value={formData.course}
    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
  >
    <option>MERN Stack</option>
    <option>React JS</option>
  </select>
  <select
    name="batch"
    value={formData.batch}
    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
  >
    <option>Batch A</option>
    <option>Batch B</option>
  </select>

  <button
    type="submit"
    className="w-full px-5 py-2 bg-[#141E46] text-white rounded-lg hover:bg-[#125f87]"
  >
    Create Student
  </button>
</form>

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL — PLACEHOLDER ADDED */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center text-[#141E46] mb-5">
              Edit Student
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Edit name"
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
              />
              <input
                placeholder="Edit email"
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
              />
              <select className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]">
                <option>MERN Stack</option>
                <option>React JS</option>
              </select>
              <select className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]">
                <option>Batch A</option>
                <option>Batch B</option>
              </select>

              <button className="w-full px-5 py-2 bg-[#141E46] text-white rounded-lg hover:bg-[#125f87]">
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCreate;
