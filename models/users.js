const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  password: String,
  token: String,
  status: { type: String, enum: ["star", "guest", "guest+"] },
  subscription: { type: Object, default: null },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
