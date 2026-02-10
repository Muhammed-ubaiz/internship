import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import Sidebar from "./sidebar";
import { MdDelete } from "react-icons/md";
import { FaHeart, FaBullhorn } from "react-icons/fa";
import Swal from "sweetalert2";

function MentorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementLoading, setAnnouncementLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchMyAnnouncements();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/mentor/notifications");

      const notes = res.data.notifications || res.data;
      const mentorMessages = notes.filter(
        (note) => note.audience === "mentors" || note.audience === "all"
      );

      setNotifications(mentorMessages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAnnouncements = async () => {
    try {
      setAnnouncementLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/mentor/my-announcements");

      setMyAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      // Don't show error alert - empty state will be shown
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // ✅ DELETE NOTIFICATION (from admin)
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
      await api.delete(`/mentor/notifications/${id}`);
      setNotifications((prev) => prev.filter((note) => note._id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch (error) {
      console.log(error);
      Swal.fire("Failed!", "Could not delete.", "error");
    }
  };

  // ✅ DELETE ANNOUNCEMENT (own)
  const handleDeleteAnnouncement = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Announcement?",
      text: "This will permanently remove your announcement!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/mentor/announcements/${id}`);
      setMyAnnouncements((prev) => prev.filter((ann) => ann._id !== id));
      Swal.fire("Deleted!", "Your announcement has been removed.", "success");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      Swal.fire("Failed!", "Could not delete announcement.", "error");
    }
  };

  // ✅ LIKE FUNCTION (frontend toggle)
  const handleLike = (id, list, setList) => {
    setList((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-6 md:ml-[220px]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
            Notifications & Announcements
          </h1>

          {/* ==================== MY ANNOUNCEMENTS SECTION ==================== */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <FaBullhorn className="text-green-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">My Announcements</h2>
            </div>

            {announcementLoading ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">Loading announcements...</p>
              </div>
            ) : myAnnouncements.length === 0 ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No announcements sent yet.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {myAnnouncements.map((ann) => (
                    <div
                      key={ann._id}
                      className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition relative"
                    >
                      {/* DELETE BUTTON FOR OWN ANNOUNCEMENT */}
                      <MdDelete
                        size={22}
                        className="absolute top-4 right-4 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        title="Delete Announcement"
                      />

                      <h2 className="font-semibold text-xl text-gray-800 mb-2 pr-8">
                        {ann.title}
                      </h2>

                      <p className="text-gray-600 mb-2">{ann.message}</p>

                      <p className="text-sm text-gray-400 mb-2">
                        Batch: <span className="font-medium text-gray-700">{ann.batch}</span>
                      </p>

                      <span className="text-xs text-gray-400 block">
                        Sent: {new Date(ann.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==================== NOTIFICATIONS FROM ADMIN SECTION ==================== */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Notifications from Admin
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No notifications yet.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {notifications.map((note) => (
                    <div
                      key={note._id}
                      className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition relative"
                    >
                      {/* DELETE BUTTON */}
                      <MdDelete
                        size={22}
                        className="absolute top-4 right-4 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteNotification(note._id)}
                        title="Delete Notification"
                      />

                      <h2 className="font-semibold text-xl text-gray-800 mb-2 pr-8">
                        {note.title}
                      </h2>

                      <p className="text-gray-600 mb-2">{note.message}</p>

                      <p className="text-sm text-gray-400 mb-2">
                        Sent by:{" "}
                        <span className="font-medium text-gray-700">
                          {note.sender || "Admin"}
                        </span>
                      </p>

                      <span className="text-xs text-gray-400 block">
                        {new Date(note.createdAt).toLocaleString()}
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

export default MentorNotifications;
