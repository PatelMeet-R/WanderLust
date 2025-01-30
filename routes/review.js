const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewCreator } = require("../middleware.js");

// reviews Route
// post review route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.reviewcreator = req.user._id;
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
  isLoggedIn,
  isReviewCreator,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
