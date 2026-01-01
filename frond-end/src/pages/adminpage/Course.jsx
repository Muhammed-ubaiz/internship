import React, { useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
import { useEffect } from "react";

function Course() {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);

  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");


  const fetchCourse = async()=>{
    try {
        const res = await axios.get("http://localhost:3001/admin/getCourse")
        const withStatus = res.data.map((course)=>({
          ...course
        }))
        setCourses(withStatus)
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(()=>{
    fetchCourse();
  },[]);

  const handleAddCourse = async(e)=>{
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/admin/addCourse",{
        name: courseName,
        duration: duration
      })
      console.log(response.data.success);
      setCourses([...courses, { name: courseName, duration: duration }]);
      setCourseName("");
      setDuration("");
      setShowCourseModal(false);
    } catch (error) {
      console.error(error);
    }
  }


  
  return (
    <div className="min-h-screen bg-[#EEF6FB] flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-36">
        {/* Header */}
        <div className="flex justify-between items-center mt-6 mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">Courses</h1>
          <button
            type="button"
            onClick={() => setShowCourseModal(true)}
            className="bg-[#141E46] text-white px-4 py-2 rounded-lg"
          >
            Add Course
          </button>
        </div>

        {/* Table */}
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

              {courses.map((course, index) => (
                <tr key={index} className="border-b hover:bg-[#F0F8FF]">
                  <td className="p-3">{course.name}</td>
                  <td className="p-3">{course.duration}</td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showCourseModal && (
          <AddCourseModal
            onClose={() => setShowCourseModal(false)}
            onAdd={handleAddCourse}
            courseName={courseName}
            setCourseName={setCourseName}
            duration={duration}
            setDuration={setDuration}
          />
        )}
      </div>
    </div>
  );
}

/* ================= MODAL ================= */

function AddCourseModal({
  onClose,
  onAdd,
  courseName,
  setCourseName,
  duration,
  setDuration,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-96 p-6 rounded-2xl shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Course</h2>

        <input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Course Name"
          className="w-full border p-2 rounded-lg mb-3"
        />

        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration"
          className="w-full border p-2 rounded-lg mb-4"
        />

        <button
          type="button"
          onClick={onAdd}
          className="w-full bg-[#141E46] text-white py-2 rounded-lg"
        >
          Add Course
        </button>
      </div>
    </div>
  );
}

export default Course;
