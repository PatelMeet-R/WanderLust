const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
      country: joi.string().required(),
      category:joi.string().required(),
      price: joi.number().min(0).required(),
      image: joi.object({
        filename: joi.string().required(),
        url: joi.string().required(),
      }),
    })
    .required(),
});

module.exports.ReviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required(),
    })
    .required(),
});
