const Listing = require("../models/listing");
const Review = require("../models/reviews");


module.exports.createReview =async (req, res) => {
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
  }
  module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  }