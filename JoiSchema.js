const Joi = require("joi");

module.exports.userSchema = Joi.object({
  username: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  image: Joi.object({
    url: Joi.string().allow("", null),
  }),
});

module.exports.postSchema = Joi.object({
  post: Joi.object({
    content: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow("", null),
    }),
  }).required(),
});

module.exports.commentSchema = Joi.object({
  content: Joi.string().required(),
});
