import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  media: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Story", storySchema);
