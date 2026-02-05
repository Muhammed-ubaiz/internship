import { useState } from "react";
import api from "../../utils/axiosConfig";
import Sidebar from "./sidebar";
import Swal from "sweetalert2";
import { FiSend } from "react-icons/fi";
import { MdTitle } from "react-icons/md";
import { FaUsers } from "react-icons/fa";

function Information() {
  const [data, setData] = useState({
    title: "",
    message: "",
    audience: "all",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!data.title || !data.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields!",
      });
      return;
    }

    try {
      await api.post("/admin/send-information", data);

      Swal.fire({
        icon: "success",
        title: "Sent Successfully!",
        text: "Information has been sent.",
        confirmButtonColor: "#141E46",
      });

      setData({ title: "", message: "", audience: "all" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Check backend server.",
      });
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100vh] bg-gradient-to-br from-[#eef2ff] to-[#f8fafc] overflow-hidden">
      <Sidebar />

      <div className="w-full md:ml-[220px] flex flex-col items-center justify-center p-4 md:p-6 min-h-[calc(100vh-2rem)]">
        <div className="bg-white/90 backdrop-blur-xl w-full max-w-3xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 min-h-[600px] md:min-h-[700px]">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Send Information</h1>
            <p className="text-gray-500 text-sm mt-1">
              Broadcast announcements to students, mentors or all users
            </p>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600">Title</label>
            <div className="flex items-center border rounded-xl px-2 md:px-3 mt-1 focus-within:ring-2 focus-within:ring-[#141E46]">
              <MdTitle className="text-gray-400 mr-2" />
              <input
                name="title"
                placeholder="Enter message title"
                value={data.title}
                onChange={handleChange}
                className="w-full p-2 md:p-3 outline-none bg-transparent text-sm md:text-base"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600">Message</label>
            <textarea
              name="message"
              placeholder="Type your message here..."
              value={data.message}
              onChange={handleChange}
              rows={6}
              className="w-full border rounded-xl p-2 md:p-4 mt-1 focus:ring-2 focus:ring-[#141E46] outline-none text-sm md:text-base"
            />
          </div>

          {/* Audience */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-600">Audience</label>
            <div className="flex items-center border rounded-xl px-2 md:px-3 mt-1">
              <FaUsers className="text-gray-400 mr-2" />
              <select
                name="audience"
                value={data.audience}
                onChange={handleChange}
                className="w-full p-2 md:p-3 outline-none bg-transparent text-sm md:text-base"
              >
                <option value="all">All Users</option>
                <option value="students">Students</option>
                <option value="mentors">Mentors</option>
              </select>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#141E46] to-[#1f2f6b] text-white py-2 md:py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all text-sm md:text-base"
          >
            <FiSend className="text-lg" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default Information;