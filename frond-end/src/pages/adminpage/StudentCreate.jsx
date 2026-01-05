import React, { useState } from "react";
import Sidebar from "./sidebar";

function StudentCreate() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-37 p-6 max-w-7xl mx-auto">
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
              <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                <td className="px-3 py-3">1</td>
                <td>Rahul</td>
                <td>rahul@gmail.com</td>
                <td>MERN Stack</td>
                <td>Batch A</td>
                <td>
                  <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    Active
                  </span>
                </td>
                <td className="flex gap-2 p-5">
                  <button className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white">
                    Inactive
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                <td className="px-3 py-3">2</td>
                <td>Ayesha</td>
                <td>ayesha@gmail.com</td>
                <td>React JS</td>
                <td>Batch B</td>
                <td>
                  <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                    Inactive
                  </span>
                </td>
                <td className="flex gap-2 p-5">
                  <button className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white">
                    Active
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                </td>
              </tr>
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
              <input
                placeholder="Enter name"
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
              />
              <input
                placeholder="Enter email"
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
              />
              <input
                type="password"
                placeholder="Enter password"
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
                Create Student
              </button>
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
