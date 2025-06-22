const mongoose = require("mongoose");

const User = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
//   profileImage: {
//     data: Buffer,
//     contentType: String,
//   },
  createdAt: { type: Date, default: Date.now },
});

const user = new mongoose.model("user", User);
module.exports = user;
