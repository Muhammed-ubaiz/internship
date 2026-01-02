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

  /* = FETCH COURSES = */

  const fetchCourse = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/getCourse");
      setCourses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  /* = ADD COURSE = */

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/admin/addCourse", {
        name: courseName,
        duration,
      });

      setCourses([...courses, res.data.course]);
      setCourseName("");
      setDuration("");
      setShowCourseModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  /* = DELETE COURSE = */

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/admin/deleteCourse/${id}`);
      setCourses(courses.filter((course) => course._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  /* = VIEW BATCH = */

  const handleViewBatch = async (course) => {
    setSelectedCourse(course);
    setShowBatchModal(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/admin/getBatches/${course._id}`
      );
      setBatches(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  /* = ADD BATCH =*/

  const handleAddBatch = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3001/admin/addBatch/${selectedCourse._id}`,
        { name: batchName }
      );
      setBatches([...batches, res.data.batch]);
      setBatchName("");
      setShowAddBatchModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  /* = EDIT COURSE = */

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setEditCourseName(course.name);
    setEditDuration(course.duration);
    setShowEditCourseModal(true);
  };

  const handleEditCourse = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3001/admin/updateCourse/${selectedCourse._id}`,
        {
          name: editCourseName,
          duration: editDuration,
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

  return (
    <div className="min-h-screen bg-[#EEF6FB] flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 p-4 md:p-6 md:ml-36">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">Courses</h1>
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-[#141E46] text-white px-4 py-2 rounded-lg"
          >
            Add Course
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-lg">
            <thead className="bg-[#D1E8FF]">
              <tr>
                <th className="p-3 text-left">Course Name</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No courses added
                  </td>
                </tr>
              )}

              {courses.map((course) => (
                <tr key={course._id} className="border-b">
                  <td className="p-3">{course.name}</td>
                  <td className="p-3">{course.duration}</td>
                  <td className="p-3 text-center flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleViewBatch(course)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      View Batches
                    </button>
                    <button
                      onClick={() => handleEditClick(course)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MODALS ================= */}

        {showCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowCourseModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Add Course</h2>
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

        {showBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowBatchModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Batches</h2>

              {batches.length === 0 ? (
                <p className="text-gray-500 mb-4">No batches found</p>
              ) : (
                <ul className="mb-4 space-y-2">
                  {batches.map((b) => (
                    <li key={b._id} className="border p-2 rounded">
                      {b.name}
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

        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Add Batch</h2>
              <input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="12-September-2024"
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

        {showEditCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowEditCourseModal(false)}
                className="absolute top-3 right-3"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Edit Course</h2>
              <input
                value={editCourseName}
                onChange={(e) => setEditCourseName(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              />
              <input
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
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
