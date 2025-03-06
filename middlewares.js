const Post = require("./models/post.js");
const Comment = require("./models/comment.js");
const { commentSchema, postSchema } = require("./JoiSchema.js");
const ExpressError = require("./ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in first to do that");
    return res.redirect("/login");
  }
  next();
};

//session cleared out after login so store in locals

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  if (
    !post.owner._id.equals(req.user._id) &&
    !(req.user.username === "admin")
  ) {
    req.flash("error", "you are not the owner of this post");
    return res.redirect("/posts");
  }
  next();
};

module.exports.validatePosts = (req, res, next) => {
  let { error } = postSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);
  if (error) {
    console.log(error);
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isCommentAuthor = async (req, res, next) => {
  let { id, CommentId } = req.params;
  let Comment = await Comment.findById(CommentId);
  if (!Comment.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the author of this Comment");
    return res.redirect(`/posts`);
  }
  next();
};
