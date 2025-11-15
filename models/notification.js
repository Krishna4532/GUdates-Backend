import mongoose from "mongoose";

const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // recipient
  type: { type: String }, // 'crush','match','like','comment','gift'
  payload: { type: Object }, // details e.g. {fromUser, postId}
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notifSchema);


