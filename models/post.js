import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: String,
  caption: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, text: String, createdAt: Date }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);

