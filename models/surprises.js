const mongoose = require("mongoose");

const surpriseSchema = mongoose.Schema({
  title: String,
  description: String,
  type: String,
  organizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  revealMode: { type: String, enum: ["time", "riddle", "manual"] },
  revealAt: Date,
  riddle: String,
  hint: String,
  answer: [String],
  notes: String,
  isUnlocked: { type: Boolean, default: false },
});

const Surprise = mongoose.model("surprises", surpriseSchema);

module.exports = Surprise;
