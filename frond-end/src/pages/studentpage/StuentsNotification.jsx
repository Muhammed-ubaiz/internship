import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import SideBarStudent from "./SideBarStudent";
import { MdDelete } from "react-icons/md";
import { FaHeart, FaBullhorn } from "react-icons/fa";
import Swal from "sweetalert2";

function StudentsNotification() {
  const [notifications, setNotifications] = useState([]);
  const [mentorNotifications, setMentorNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    fetchNotifications();
    fetchMentorNotifications();
  }, []);

  // Fetch notifications from admin
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/student/notifications");

      const adminMessages = (res.data.notifications || res.data).filter(
        (msg) => msg.audience === "students" || msg.audience === "all"
      );

      // Add liked state
      const messagesWithLike = adminMessages.map((msg) => ({
        ...msg,
        liked: false,
      }));

      setNotifications(messagesWithLike);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications from mentors
  const fetchMentorNotifications = async () => {
    try {
      setMentorLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/student/announcements");

      setMentorNotifications(res.data.announcements || []);
    } catch (error) {
      console.error("Error fetching mentor notifications:", error);
    } finally {
      setMentorLoading(false);
    }
  };

  const handleLike = (id) => {
    setNotifications((prev) =>
      prev.map((msg) =>
        msg._id === id ? { ...msg, liked: !msg.liked } : msg
      )
    );
  };

  // Delete notification (from admin)
  const handleDeleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Notification?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#141E46",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/student/notifications/${id}`);
      setNotifications((prev) => prev.filter((msg) => msg._id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch (error) {
      console.log(error);
      Swal.fire("Failed!", "Could not delete.", "error");
    }
  };

  // Delete mentor notification
  const handleDeleteMentorNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Mentor Notification?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#141E46",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/student/announcements/${id}`);
      setMentorNotifications((prev) => prev.filter((msg) => msg._id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch (error) {
      console.log(error);
      Swal.fire("Failed!", "Could not delete.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      <SideBarStudent />

      <div className="lg:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#141E46]">
              Notifications
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46]">
              Notifications
            </h2>
          </div>

          {/* ==================== NOTIFICATIONS FROM MENTORS SECTION ==================== */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaBullhorn className="text-green-500 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">
                Notifications from Mentors
              </h2>
            </div>

            {mentorLoading ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md max-w-xl mx-auto">
                <p className="text-gray-500">Loading mentor notifications...</p>
              </div>
            ) : mentorNotifications.length === 0 ? (
              <div className="flex justify-center items-center h-32 rounded-lg max-w-xl mx-auto">
                <p className="text-gray-500">No notifications from mentors.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                  {mentorNotifications.map((msg) => (
                    <div
                      key={msg._id}
                      className="bg-[#EEF6FB] p-5 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition relative"
                    >
                      {/* DELETE BUTTON FOR MENTOR NOTIFICATIONS */}
                      <MdDelete
                        size={22}
                        className="absolute top-4 right-4 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteMentorNotification(msg._id)}
                      />

                      <h2 className="font-semibold text-xl text-gray-800 mb-2 pr-8">
                        {msg.title}
                      </h2>

                      <p className="text-gray-600 mb-2">{msg.message}</p>

                      <p className="text-sm text-gray-400 mb-2">
                        Batch:{" "}
                        <span className="font-medium text-gray-700">
                          {msg.batch || "All Batches"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400 mb-2">
                        From:{" "}
                        <span className="font-medium text-gray-700">
                          {msg.mentorName || msg.sender || "Mentor"}
                        </span>
                      </p>

                      {msg.mentorEmail && (
                        <p className="text-sm text-gray-400 mb-2">
                          Email:{" "}
                          <span className="font-medium text-gray-700">
                            {msg.mentorEmail}
                          </span>
                        </p>
                      )}

                      <span className="text-xs text-gray-400 block">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==================== NOTIFICATIONS FROM ADMIN SECTION ==================== */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBullhorn className="text-blue-500 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">
                Notifications from Admin
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md max-w-xl mx-auto">
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex justify-center items-center h-64 rounded-lg max-w-xl mx-auto">
                <p className="text-gray-500 text-lg">No notifications from admin.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                  {notifications.map((msg) => (
                    <div
                      key={msg._id}
                      className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition relative"
                    >
                      {/* DELETE BUTTON FOR ADMIN NOTIFICATIONS */}
                      <MdDelete
                        size={22}
                        className="absolute top-4 right-4 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteNotification(msg._id)}
                      />

                      <h2 className="font-semibold text-xl text-gray-800 mb-2 pr-8">
                        {msg.title}
                      </h2>

                      <p className="text-gray-600 mb-2">{msg.message}</p>

                      <p className="text-sm text-gray-400 mb-2">
                        Sent by:{" "}
                        <span className="font-medium text-gray-700">
                          {msg.sender || "Admin"}
                        </span>
                      </p>

                      <span className="text-xs text-gray-400 block">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentsNotification;