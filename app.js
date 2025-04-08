if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const PORT = 3000;
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Post = require("./models/post.js");
const Comment = require("./models/comment.js");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./ExpressError.js");
const multer = require("multer");
const { storageProfiles, storagePosts } = require("./cloudConfig.js");
const uploadProfiles = multer({ storage: storageProfiles });
const uploadPosts = multer({ storage: storagePosts });
const { isLoggedIn, saveRedirectUrl, isOwner } = require("./middlewares.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const sessionOptions = {
  secret: "socioproject",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use(methodOverride("_method"));

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

app.get("/posts", isLoggedIn, async (req, res) => {
  let allPosts = await Post.find({}).populate("owner");
  console.log(allPosts);
  res.render("index.ejs", { allPosts });
});

app.post("/signup", async (req, res) => {
  try {
    let { username, email, password, dob } = req.body;
    let newUser = new User({ username, email, dob });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "new user registered successfully");
      res.redirect("/posts");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "successfully logged in");
    let redirectUrl = res.locals.redirectUrl || "/posts";
    res.redirect(redirectUrl);
  }
);

app.get("/logout", isLoggedIn, (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "successfully logged out");
    res.redirect("/");
  });
});

app.get("/posts/new", isLoggedIn, (req, res) => {
  res.render("createPost.ejs");
});

app.post(
  "/posts/new",
  isLoggedIn,
  uploadPosts.single("postImage"),
  async (req, res) => {
    let { content } = req.body;
    let { filename, path } = req.file;
    let url = path;
    let image = { filename, url };
    let createdAt = Date.now();
    let owner = req.user._id;
    let newPost = await new Post({ content, image, createdAt, owner });
    await newPost.save();
    req.flash("success", "new post created successfully");
    res.redirect("/posts");
  }
);

app.get("/posts/search", async (req, res) => {
  let query = req.query.q;
  let posts = await Post.find({
    content: { $regex: query, $options: "i" },
  }).populate("owner");
  res.render("index.ejs", { allPosts: posts });
});

app.delete("/posts/delete/:id", isLoggedIn, isOwner, async (req, res) => {
  try {
    let { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash("success", "post deleted successfully");
    res.redirect("/posts");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/posts");
  }
});

app.get("/posts/edit/:id", isLoggedIn, isOwner, async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  res.render("editPost.ejs", { post });
});

app.put("/posts/edit/:id", isLoggedIn, isOwner, async (req, res) => {
  try {
    let { id } = req.params;
    let { content } = req.body.post;
    let post = await Post.findById(id);
    post.content = content;
    await post.save();
    req.flash("success", "post updated successfully");
    res.redirect("/posts");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/posts");
  }
});

app.get("/profile/edit", isLoggedIn, (req, res) => {
  res.render("editProfile.ejs");
});

app.post(
  "/profile/edit",
  isLoggedIn,
  uploadProfiles.single("profilePhoto"),
  async (req, res) => {
    let { bio } = req.body;
    let profilePhoto;
    if (req.file) {
      let { filename, path } = req.file;
      let url = path;
      profilePhoto = { filename, url };
    }
    let user = await User.findById(req.user._id);
    user.bio = bio;
    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
    }
    await user.save();
    req.flash("success", "profile updated successfully");
    res.redirect("/profile/edit");
  }
);

app.get("/posts/:id/comment/delete/:commentid", async (req, res) => {
  try {
    let { id, commentid } = req.params;
    let comment = await Comment.findById(commentid);
    console.log(comment);
    if (req.user._id.toString() === comment.author.toString() && req.user) {
      await Post.findByIdAndUpdate(id, { $pull: { comments: commentid } });
      await Comment.findByIdAndDelete(commentid);
      res.redirect(`/posts/${id}`);
    }
  } catch (err) {
    let { id, commentid } = req.body;
    console.log(err);
    res.redirect(`/posts/${id}`);
  }
});

app.post("/posts/:id/comment", async (req, res) => {
  let post = await Post.findById(req.params.id);
  let newComment = new Comment(req.body.comment);
  newComment.author = req.user._id;
  console.log(newComment);
  post.comments.push(newComment);
  await post.save();
  await newComment.save();
  req.flash("success", "comment added");
  res.redirect(`/posts/${post._id}`);
});

app.get("/posts/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id)
    .populate({ path: "comments", populate: { path: "author" } })
    .populate("owner");
  console.log(post);
  res.render("showPost.ejs", { post });
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  console.log(err);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
  console.log("server started listening on port", PORT);
});
