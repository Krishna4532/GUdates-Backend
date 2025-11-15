import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Story", storySchema);


