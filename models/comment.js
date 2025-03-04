const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: String,
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;
