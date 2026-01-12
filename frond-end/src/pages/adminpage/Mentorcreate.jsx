import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./sidebar";

function Mentorcreate() {
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");

  const [mentors, setMentors] = useState([]);

  // ================= ADD MENTOR =================
  const handleAddMentor = async (e) => {
    e.preventDefault();

    if (!course) {
      alert("Please select course");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addMentor",
        { name, email, password, course },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setMentors((prev) => [...prev, res.data.mentor]);
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCourse("");
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Mentor Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141E46] text-white px-6 py-2 rounded-lg"
          >
            + Create Mentor
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-5 overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-[#D1E8FF]">
              <tr className="text-center">
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Course</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {mentors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-3">
                    No mentors found
                  </td>
                </tr>
              ) : (
                mentors.map((mentor, index) => (
                  <tr key={mentor._id} className="text-center">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{mentor.name}</td>
                    <td className="p-3">{mentor.email}</td>
                    <td className="p-3">{mentor.course}</td>
                    <td className="p-3">{mentor.status || "Active"}</td>
                    <td className="p-3">
  
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <form onSubmit={handleAddMentor} className="space-y-3">
              <input
              type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full border p-2"
              />
              <input
              type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border p-2"
              />
              <input
              type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border p-2"
              />
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Course"
                className="w-full border p-2"
              />
              <button className="bg-[#141E46] text-white w-full py-2">
                Create Mentor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentorcreate;
