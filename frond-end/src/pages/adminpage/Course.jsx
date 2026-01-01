import React, { useState } from "react";
import Sidebar from "./sidebar";

function Course() {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showBatchListModal, setShowBatchListModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const courses = [
    { name: "React for Beginners", duration: "7 months" },
    { name: "Advanced JavaScript", duration: "5 months" },
    { name: "Node.js Mastery", duration: "6 months" },
  ];

  return (
        <div className="min-h-screen bg-[#EEF6FB] flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-34">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">Courses</h1>
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-[#141E46] hover:bg-[#2e3656] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Add Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white rounded-2xl shadow-xl overflow-hidden">
            <thead className="bg-[#D1E8FF]">
              <tr>
                <th className="p-3 text-left border-b text-[#141E46]">Course Name</th>
                <th className="p-3 text-left border-b text-[#141E46]">Duration</th>
                <th className="p-3 text-center border-b text-[#141E46]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={index} className="border-b hover:bg-[#F0F8FF] transition-colors">
                  <td className="p-3">{course.name}</td>
                  <td className="p-3">{course.duration}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => setShowBatchListModal(true)}
                      className="bg-[#1679AB] hover:bg-[#0f5780] text-white px-3 py-1 rounded-lg transition-all duration-300"
                    >
                      View Batches
                    </button>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="bg-[#141E46] hover:bg-[#2c3763] text-white px-3 py-1 rounded-lg transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => alert("Delete clicked")}
                      className="bg-[#DC2626] hover:bg-[#b91c1c] text-white px-3 py-1 rounded-lg transition-all duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showCourseModal && <CourseModal onClose={() => setShowCourseModal(false)} />}
        {showEditModal && <EditCourseModal onClose={() => setShowEditModal(false)} />}
        {showBatchListModal && (
          <BatchListModal
            onClose={() => setShowBatchListModal(false)}
            onAddBatch={() => setShowBatchModal(true)}
          />
        )}
        {showBatchModal && <BatchModal onClose={() => setShowBatchModal(false)} />}
      </div>
    </div>
  );
}

// Add Course Modal
function CourseModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#141E46]">Add Course</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <input
          className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:ring-2 focus:ring-[#1679AB]"
          placeholder="Course Name"
        />
        <input
          className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:ring-2 focus:ring-[#1679AB]"
          placeholder="Duration"
        />
        <button className="w-full bg-[#141E46] hover:bg-[#2e3656] text-white py-2 rounded-lg font-semibold transition-all duration-300">
          Add
        </button>
      </div>
    </div>
  );
}

// Edit Course Modal
function EditCourseModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#141E46]">Edit Course</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <input
          className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:ring-2 focus:ring-[#1679AB]"
          placeholder="Course Name"
          defaultValue="Sample Course"
        />
        <input
          className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:ring-2 focus:ring-[#1679AB]"
          placeholder="Duration"
          defaultValue="7 months"
        />
        <button className="w-full bg-[#141E46] hover:bg-[#2c3763] text-white py-2 rounded-lg font-semibold transition-all duration-300">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Batch List Modal
function BatchListModal({ onClose, onAddBatch }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#141E46]">Batches</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <ul className="list-disc pl-5 text-[#141E46]">
          <li>30-September-2025</li>
          <li>15-October-2025</li>
          <li>01-November-2025</li>
        </ul>
        <button
          onClick={onAddBatch}
          className="w-full mt-4 bg-[#1679AB] hover:bg-[#0f5780] text-white py-2 rounded-lg font-semibold transition-all duration-300"
        >
          Add Batch
        </button>
      </div>
    </div>
  );
}

// Batch Modal
function BatchModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#141E46]">Add Batch</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <input
          className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:ring-2 focus:ring-[#1679AB]"
          placeholder="Batch Date"
        />
        <button className="w-full bg-[#141E46] hover:bg-[#2e3656] text-white py-2 rounded-lg font-semibold transition-all duration-300">
          Add
        </button>
      </div>
    </div>
  );
}

export default Course;
