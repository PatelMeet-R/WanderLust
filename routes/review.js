const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewCreator,
} = require("../middleware.js");
const reviewController = require("../Controller/reviews.js");

router
  .route("/")
  .post(isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
router
  .route("/:reviewId")
  .delete(
    isLoggedIn,
    isReviewCreator,
    wrapAsync(reviewController.destroyReview)
  );

module.exports = router;
