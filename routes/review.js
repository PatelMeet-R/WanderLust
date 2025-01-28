const express = require("express");
const router = express.Router({ mergeParams: true });
const { ReviewSchema } = require("../Schema");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

function validateReview(req, res, next) {
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
}

// reviews Route
// post review route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    // console.log("new review saved", newReview);
    req.flash("success", "New review added");
    res.redirect(`/listings/${listing._id}`);
  })
);

// destroy review route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Review deleted!')
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
