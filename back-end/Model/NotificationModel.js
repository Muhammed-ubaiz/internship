import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    audience: {
      type: String,
      enum: ["all", "students", "mentors"],
      default: "all",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", NotificationSchema);
