import { useState } from "react";
import axios from "axios";
import Sidebar from "./sidebar";
import Swal from "sweetalert2";

function Information() {

  const [data, setData] = useState({
    title: "",
    message: "",
    audience: "all",
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
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

      await axios.post(
        "http://localhost:3001/admin/send-information",
        data
      );
      console.log();
      

      Swal.fire({
        icon: "success",
        title: "Sent Successfully!",
        text: "Information has been sent.",
        confirmButtonColor: "#141E46",
      });

      setData({
        title: "",
        message: "",
        audience: "all",
      });

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
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb]">

      <Sidebar />

      <div className="ml-[220px] w-full p-6 flex items-center">

        <div className="bg-white w-full rounded-xl shadow-lg p-6">

          <h1 className="text-2xl font-bold mb-4">
            Send Information
          </h1>

          <input
            name="title"
            placeholder="Title"
            value={data.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <textarea
            name="message"
            placeholder="Message"
            value={data.message}
            onChange={handleChange}
            rows={4}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <select
            name="audience"
            value={data.audience}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          >
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="mentors">Mentors</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#141E46] text-white py-3 rounded-lg hover:bg-[#1a2858]"
          >
            Send Message
          </button>

        </div>
      </div>
    </div>
  );
}

export default Information;
