import mongoose from "mongoose";

const coupleSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // pair
  points: { type: Number, default: 0 }
});

export default mongoose.model("Couple", coupleSchema);
