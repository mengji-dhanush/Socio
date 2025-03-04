const Joi = require("joi");

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
