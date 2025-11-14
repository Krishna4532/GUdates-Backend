import mongoose from "mongoose";

const giftSchema = new mongoose.Schema({
  title: String,
  emoji: String,
  cost: Number
});

export default mongoose.model("Gift", giftSchema);
