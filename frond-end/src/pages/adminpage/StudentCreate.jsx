import React, { useState } from "react";

function StudentCreate() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Students Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-[#141E46] text-white px-6 py-2 rounded-lg hover:bg-[#2e3656] transition"
          >
            + Create Student
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-[#141E46] mb-4">
            Student List
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full border-separate border-spacing-y-3 text-sm">
              <thead>
                <tr className="text-[#1679AB]">
                  <th className="text-left px-3">#</th>
                  <th className="text-left px-3">Name</th>
                  <th className="text-left px-3">Email</th>
                  <th className="text-left px-3">Course</th>
                  <th className="text-left px-3">Batch</th>
                  <th className="text-left px-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {/* Row 1 */}
                <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition rounded-xl">
                  <td className="px-3 py-4 font-semibold text-[#141E46]">1</td>
                  <td className="px-3 py-4 font-medium">Rahul</td>
                  <td className="px-3 py-4 text-gray-600">rahul@gmail.com</td>
                  <td className="px-3 py-4">MERN Stack</td>
                  <td className="px-3 py-4">Batch A</td>
                  <td className="px-3 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition rounded-xl">
                  <td className="px-3 py-4 font-semibold text-[#141E46]">2</td>
                  <td className="px-3 py-4 font-medium">Ayesha</td>
                  <td className="px-3 py-4 text-gray-600">ayesha@gmail.com</td>
                  <td className="px-3 py-4">React JS</td>
                  <td className="px-3 py-4">Batch B</td>
                  <td className="px-3 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Inactive
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border">

            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center text-[#141E46] mb-5">
              Create Student
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#141E46]">Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
                />
              </div>

              <div>
                <label className="text-sm text-[#141E46]">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]"
                />
              </div>

              <div>
                <label className="text-sm text-[#141E46]">Course</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]">
                  <option>MERN Stack</option>
                  <option>React JS</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[#141E46]">Batch</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#1679AB]">
                  <option>Batch A</option>
                  <option>Batch B</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button className="px-5 py-2 bg-[#1679AB] text-white rounded-lg hover:bg-[#125f87]">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCreate;
