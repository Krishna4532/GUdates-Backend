import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reported: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
