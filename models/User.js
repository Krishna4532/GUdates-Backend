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
  
  // NEW: Crucial flag for the frontend flow!
  profileComplete: { type: Boolean, default: false },

  points: { type: Number, default: 0 },
  crushPoints: { type: Number, default: 0 },
  couplePoints: { type: Number, default: 0 }
  // REMOVED: createdAt is now handled by timestamps
}, 
// NEW: Add Mongoose automatic timestamps for 'createdAt' and 'updatedAt'
{ timestamps: true }); 

/* hash password */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);



