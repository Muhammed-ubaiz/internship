import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideBarStudent"; // Student sidebar
import { MdDelete } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import Swal from "sweetalert2";

function StudentsNotification() {
  const [notifications, setNotifications] = useState([]);
  const [role, setRole] = useState(""); // current user role

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    fetchNotifications();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3001/student/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Only show messages for students or all
      const studentMessages = (res.data.notifications || res.data).filter(
        (msg) => msg.audience === "students" || msg.audience === "all"
      );

      // Add liked state
      const messagesWithLike = studentMessages.map((msg) => ({
        ...msg,
        liked: false,
      }));

      setNotifications(messagesWithLike);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  // Like toggle
  const handleLike = (id) => {
    setNotifications((prev) =>
      prev.map((msg) =>
        msg._id === id ? { ...msg, liked: !msg.liked } : msg
      )
    );
  };

  // Delete notification (bucket icon)
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Notification?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#141E46",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3001/student/notifications/${id}`);
      setNotifications((prev) => prev.filter((msg) => msg._id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch (error) {
      console.log(error);
      Swal.fire("Failed!", "Could not delete.", "error");
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 ml-[220px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No notifications yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((msg) => (
              <div
                key={msg._id}
                className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition relative"
              >
                {/* DELETE BUTTON (always visible like MentorNotifications) */}
                <MdDelete
                  size={22}
                  className="absolute top-4 right-4 text-red-500 cursor-pointer hover:scale-110"
                  onClick={() => handleDelete(msg._id)}
                />

                <h2 className="font-semibold text-xl text-gray-800 mb-2">
                  {msg.title}
                </h2>

                <p className="text-gray-600 mb-2">{msg.message}</p>

                <p className="text-sm text-gray-400 mb-2">
                  Sent by:{" "}
                  <span className="font-medium text-gray-700">
                    {msg.sender || "Admin"}
                  </span>
                </p>

                <span className="text-xs text-gray-400 block mb-3">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsNotification;
