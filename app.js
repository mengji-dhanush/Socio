if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const PORT = 3000;
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Post = require("./models/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./ExpressError.js");
const multer = require("multer");
const { storageProfiles, storagePosts } = require("./cloudConfig.js");
const uploadProfiles = multer({ storage: storageProfiles }); // Corrected
const uploadPosts = multer({ storage: storagePosts }); // Corrected
const { isLoggedIn, saveRedirectUrl } = require("./middlewares.js");

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

app.get("/new", isLoggedIn, (req, res) => {
  res.render("createPost.ejs");
});

app.post(
  "/new",
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

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile.ejs");
});

app.post(
  "/profile",
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
    res.redirect("/profile");
  }
);

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
