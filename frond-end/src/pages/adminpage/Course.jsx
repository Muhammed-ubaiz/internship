import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";

function Course() {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);

  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");

  const [editCourseName, setEditCourseName] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // ================= FETCH COURSES =================
  const fetchCourse = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    try {
      const res = await axios.get(
        "http://localhost:3001/admin/getCourse",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  // ================= ADD COURSE =================
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        "http://localhost:3001/admin/addCourse",
        { name: courseName, duration },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );

      setCourses([...courses, res.data.course]);
      setCourseName("");
      setDuration("");
      setShowCourseModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= VIEW BATCH =================
  const handleViewBatch = async (course) => {
    setSelectedCourse(course);
    setShowBatchModal(true);

    try {
      const res = await axios.get(
        `http://localhost:3001/admin/getBatches/${course.name}`
      );
      setBatches(res.data.batches);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= ADD BATCH =================
  const handleAddBatch = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3001/admin/addBatch/${selectedCourse.name}`,
        { name: batchName }
      );
      setBatches([...batches, res.data.batch]);
      setBatchName("");
      setShowAddBatchModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE BATCH =================
  const handleDeleteBatch = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3001/admin/deleteBatch/${id}`
      );
      setBatches(batches.filter((b) => b._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ================= EDIT COURSE =================
  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setEditCourseName(course.name);
    setEditDuration(course.duration);
    setShowEditCourseModal(true);
  };

  const handleEditCourse = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        `http://localhost:3001/admin/updateCourse/${selectedCourse._id}`,
        { editCourseName, editDuration },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );

      setCourses(
        courses.map((c) =>
          c._id === selectedCourse._id ? res.data.course : c
        )
      );

      setShowEditCourseModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (course) => {
  try {
    

    const res = await axios.put(
      `http://localhost:3001/admin/course/status/${course._id}`,
      {},
     
    );

    setCourses(
      courses.map((c) =>
        c._id === course._id ? res.data.data : c
      )
    );
  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="min-h-screen bg-[#EEF6FB] flex">
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 ">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Courses
          </h1>
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-[#141E46] text-white px-6 py-2 rounded-lg"
          >
            Add Course
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-2xl p-5">
          <table className="w-full text-sm border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[#1679AB]">
                <th>#</th>
                <th>Course Name</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course, index) => (
                <tr
                  key={course._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF]"
                >
                  <td className="p-3">{index + 1}</td>
                  <td  className="px-4 py-3 w-[200px] break-all text-center">{course.name}</td>
                  <td  className="px-4 py-3 w-[200px] break-all text-center">{course.duration}</td>

                  <td  className="px-4 py-3 w-[200px] break-all text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === "active"
                          ? "bg-green-100 text-green-700 px-8"
                          : "bg-red-100 text-red-700 px-7"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>

                  <td   className="p-3 text-center flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleViewBatch(course)}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
                    >
                      Batches
                    </button>

                    <button
                      onClick={() => handleEditClick(course)}
                      className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(course)}
                      className={`px-3 py-1 text-xs rounded-lg text-white ${
                        course.status === "active"
                          ? "bg-red-600 hover:bg-red-700 px-5 "
                          : "bg-green-600 hover:bg-green-700 px-6"
                      }`}
                    >
                      {course.status === "active"
                        ? "Inactive"
                        : "Active"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= ADD COURSE MODAL ================= */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowCourseModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Add Course
              </h2>
              <input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course Name"
                className="w-full border p-2 rounded mb-3"
              />
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration"
                className="w-full border p-2 rounded mb-4"
              />
              <button
                onClick={handleAddCourse}
                className="w-full bg-[#141E46] text-white py-2 rounded"
              >
                Add Course
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW BATCH MODAL ================= */}
        {showBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowBatchModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Batches for {selectedCourse?.name}
              </h2>

              {batches.length === 0 ? (
                <p className="text-gray-500">
                  No batches found
                </p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {batches.map((b) => (
                    <li
                      key={b._id}
                      className="flex justify-between bg-gray-200 p-2 rounded"
                    >
                      <span>{b.name}</span>
                      <button
                        onClick={() => handleDeleteBatch(b._id)}
                        className="text-red-600"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setShowAddBatchModal(true)}
                className="w-full bg-[#141E46] text-white py-2 rounded"
              >
                Add Batch
              </button>
            </div>
          </div>
        )}

        {/* ================= ADD BATCH MODAL ================= */}
        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Add Batch
              </h2>
              <input
                type="date"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              />
              <button
                onClick={handleAddBatch}
                className="w-full bg-[#141E46] text-white py-2 rounded"
              >
                Add Batch
              </button>
            </div>
          </div>
        )}

        {/* ================= EDIT COURSE MODAL ================= */}
        {showEditCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowEditCourseModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Edit Course
              </h2>
              <input
                value={editCourseName}
                onChange={(e) =>
                  setEditCourseName(e.target.value)
                }
                className="w-full border p-2 rounded mb-3"
              />
              <input
                value={editDuration}
                onChange={(e) =>
                  setEditDuration(e.target.value)
                }
                className="w-full border p-2 rounded mb-4"
              />
              <button
                onClick={handleEditCourse}
                className="w-full bg-[#141E46] text-white py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Course;
