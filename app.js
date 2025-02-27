const PORT = 3000;
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Post = require("./models/post.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/socio");
  console.log("connected to database");
}

main().catch((err) => {
  console.log("connection to database failed:", err);
});

app.get("/", (req, res) => {
  res.render("landingPage.ejs");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/posts", async (req, res) => {
  allPosts = await Post.find({});
  res.render("index.ejs", { allPosts });
});

app.listen(PORT, () => {
  console.log("server started listening on port", PORT);
});
