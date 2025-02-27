const mongoose = require("mongoose");
const Post = require("../models/post.js");
const initPosts = require("./data.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/socio");
  console.log("connected to database");
}

main().catch((err) => {
  console.log("connection to database failed:", err);
});

const initDB = async () => {
  try {
    await Post.deleteMany({});
    await Post.insertMany(initPosts);
    console.log("insert into db successful");
  } catch (e) {
    console.log("insert into db failed:", e);
  }
};

initDB();
