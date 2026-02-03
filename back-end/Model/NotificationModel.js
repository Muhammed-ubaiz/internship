import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    audience: {
      type: String,
      enum: ["all", "mentors", "students"],
      default: "all",
    },
    sender: {
      type: String,
      default: "Admin",
    },

    // ⭐ IMPORTANT
    deletedBy: {
      type: [String], // ["mentor", "student"]
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
