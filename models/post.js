const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: {
    filename: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  content: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: [
      "Technology",
      "Lifestyle",
      "Food",
      "Travel",
      "Fitness",
      "Education",
      "Entertainment",
      "News",
      "Other",
    ],
    required: true,
    default: "Other",
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const Post = new mongoose.model("Post", postSchema);
module.exports = Post;
