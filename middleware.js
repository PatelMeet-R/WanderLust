const Listing = require("./models/listing");
const Review = require("./models/reviews");
const { listingSchema, ReviewSchema } = require("./Schema");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    // console.log(req.session.redirectUrl);
    req.flash("error", "You must be login");
    return res.redirect("/login");
  }
  next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you have don't have permission to Edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewCreator = async (req, res, next) => {
  let { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review.reviewcreator.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};



// module.exports.isReviewCreator = async (req, res, next) => {
//   let { id, reviewId } = req.params;
//   let review = await Review.findById(reviewId);
//   if (currUser && !review.reviewcreator.equals(req.locals.currUser._id)) {
//     req.flash("error", "you are not author of this review");
//     res.redirect(`/listings/${id}`);
//   }
//   next();
// };

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    // Return el.message so that the error messages are mapped properly
    let errMsg = error.details
      .map((el) => el.message) // Return el.message here
      .join(",");
    console.log(errMsg);
    throw new ExpressError(400, errMsg); // Throw the custom error with status code and message
  } else {
    next(); // Call next() if validation is successful
  }
};
module.exports.validateReview = (req, res, next) => {
  let { error } = ReviewSchema.validate(req.body);

  if (error) {
    // Return el.message so that the error messages are mapped properly
    let errMsg = error.details
      .map((el) => el.message) // Return el.message here
      .join(",");
    console.log(errMsg);
    throw new ExpressError(400, errMsg); // Throw the custom error with status code and message
  } else {
    next(); // Call next() if validation is successful
  }
};
