const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  user: { type: String, required: true },
  username: {type:String},
  title: { type: String, required: true },
  description: { type: String },
  thumbnail:{ type: String },
  isLive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number }, // Duration in seconds
  likes: [{
    userId: { type: String, required: true }
  }],
  comments: [{
    user: { type: String, required: true },
    text: { type: String, required: true },
  }],
});

module.exports = mongoose.model("Stream", streamSchema);
