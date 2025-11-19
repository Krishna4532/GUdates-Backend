import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile fields
  age: Number,
  height: Number,
  interests: [String],
  course: String,
  bio: String,
  avatar: { type: String, default: "" },

  // Points
  crushPoints: { type: Number, default: 0 },
  couplePoints: { type: Number, default: 0 },
  profilePoints: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("User", userSchema);





