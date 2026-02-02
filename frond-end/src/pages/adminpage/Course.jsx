import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

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

  const [batchSearch, setBatchSearch] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editCourseName, setEditCourseName] = useState("");
  const [editDuration, setEditDuration] = useState("");

  const fetchCourse = async () => {
    const token = localStorage.getItem("token");  
    const role = localStorage.getItem("role");
    try {
      const res = await axios.get("http://localhost:3001/admin/getCourse", {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });
      
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

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

      Swal.fire({
        title: "Course Added Successfully!",
        icon: "success",
        draggable: true,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const handleViewBatch = async (course) => {
    setSelectedCourse(course);
    setShowBatchModal(true);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get(
        `http://localhost:3001/admin/getBatches/${course.name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );
      setBatches(res.data.batches);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBatch = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.post(
        `http://localhost:3001/admin/addBatch/${selectedCourse.name}`,
        { name: batchName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );

      setBatches([...batches, res.data.batch]);
      setBatchName("");
      setShowAddBatchModal(false);

      Swal.fire({
        title: "Batch Added Successfully!",
        icon: "success",
        draggable: true,
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBatch = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        try {
          await axios.delete(
            `http://localhost:3001/admin/deleteBatch/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Role: role,
              },
            }
          );

          setBatches(batches.filter((b) => b._id !== id));

          Swal.fire({
            title: "Deleted!",
            text: "Batch has been deleted.",
            icon: "success"
          });

        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setEditCourseName(course.name);
    setEditDuration(course.duration);
    setShowEditCourseModal(true);
  };

  const handleEditCourse = async () => {
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    }).then(async (result) => {
      if (result.isConfirmed) {
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

          Swal.fire("Saved!", "", "success");
        } catch (error) {
          console.error(error);
        }
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };

  const handleToggleStatus = async (course) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/admin/course/status/${course._id}`
      );

      setCourses(
        courses.map((c) => (c._id === course._id ? res.data.data : c))
      );

      Swal.fire({
        icon: "success",
        title: "Course status updated",
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      console.error(error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      course.name.toLowerCase().includes(search) ||
      course.duration.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || course.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredBatches = batches.filter((b) =>
    b.name.toLowerCase().includes(batchSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6">
      <Sidebar />

      <div className="lg:ml-52 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6 
sticky top-0 bg-[#EEF6FB] py-2">


          <h1 className="text-xl sm:text-2xl font-semibold text-[#141E46] font-[Montserrat] text-center sm:text-left">
            Courses Management
          </h1>
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-[#141E46] text-white px-4 sm:px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            + Add Course
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl p-3 sm:p-5 max-h-[640px] overflow-y-auto">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sticky top-0 bg-white py-4 z-10">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#141E46] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12"
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
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-72 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  <option value="All">All Courses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {filteredCourses.length === 0 ? (
              <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
                No courses found
              </div>
            ) : (
              filteredCourses.map((course, index) => (
                <div
                  key={course._id}
                  className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                      <h3 className="font-semibold text-[#141E46] mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.duration}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        course.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewBatch(course)}
                      className="flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg bg-blue-600 text-white"
                    >
                      Batches
                    </button>
                    <button
                      onClick={() => handleEditClick(course)}
                      className="flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg bg-yellow-500 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(course)}
                      className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg text-white ${
                        course.status === "active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {course.status === "active" ? "Inactive" : "Active"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-3">
              <thead className="h-15 sticky top-18 bg-white">
                <tr className="text-[#1679AB]">
                  <th className="px-2">#</th>
                  <th className="px-2">Course Name</th>
                  <th className="px-2">Duration</th>
                  <th className="px-2">Status</th>
                  <th className="px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                    <td colSpan="5" className="text-center p-3 rounded-2xl">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, index) => (
                    <tr
                      key={course._id}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                    >
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-center break-words">
                        {course.name}
                      </td>
                      <td className="px-4 py-3 text-center break-words">
                        {course.duration}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            course.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
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
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {course.status === "active" ? "Inactive" : "Active"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md relative">
              <button
                onClick={() => setShowCourseModal(false)}
                className="absolute top-3 right-3 text-xl"
              >
                ✕
              </button>
 <h2 className="text-lg font-semibold mb-4 mt-2 sm:mt-3 md:mt-0">
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

        {/* Batch Modal */}
        {showBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md relative max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setShowBatchModal(false)}
                className="absolute top-3 right-3 text-xl"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Batches for {selectedCourse?.name}
              </h2>

              <div className="group relative mb-5">
                <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                  <input
                    type="text"
                    placeholder="Search batch..."
                    value={batchSearch}
                    onChange={(e) => setBatchSearch(e.target.value)}
                    className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                  />
                  <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#141E46] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12"
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
                  </button>
                </div>
              </div>

              {filteredBatches.length === 0 ? (
                <p className="text-gray-500 mb-4">No batches found</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {filteredBatches.map((b) => (
                    <li
                      key={b._id}
                      className="flex justify-between items-center bg-gray-200 p-3 rounded transform transition-all duration-300 hover:scale-98"
                    >
                      <span className="break-all pr-2">{b.name}</span>
                      <button
                        onClick={() => handleDeleteBatch(b._id)}
                        className="hover:text-red-500 transform transition-all duration-300 hover:scale-150 flex-shrink-0"
                      >
                        <MdDelete />
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

        {/* Add Batch Modal */}
        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md relative">
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="absolute top-3 right-3 text-xl"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Add Batch</h2>
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

        {/* Edit Course Modal */}
        {showEditCourseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md relative">
              <button
                onClick={() => setShowEditCourseModal(false)}
                className="absolute top-3 right-3 text-xl"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Edit Course</h2>
              <input
                value={editCourseName}
                onChange={(e) => setEditCourseName(e.target.value)}
                className="w-full border p-2 rounded mb-3"
                placeholder="Course Name"
              />
              <input
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                placeholder="Duration"
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