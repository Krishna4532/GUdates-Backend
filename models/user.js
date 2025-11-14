import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  bio: { type: String, default: "" },
  course: String,
  age: Number,
  heightCm: Number,
  interests: [String],
  profilePic: { type: String, default: "" },
  points: { type: Number, default: 0 },       // total points
  crushPoints: { type: Number, default: 0 },  // for trending crush
  couplePoints: { type: Number, default: 0 }, // for power couple (if needed)
  createdAt: { type: Date, default: Date.now }
});

/* hash password */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
