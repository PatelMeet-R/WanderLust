const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../Schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");

function validateListing(req, res, next) {
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
}

// Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // res.send("this is testing route");
    res.render("listings/index.ejs", { allListings });
  })
);
// samplelisting route //check the data insertion and route
// app.get("/testListing", async (req,res) => {
//   let sampleListing = new Listing({
//     title: "my new villa",
//     description: "by the beach",
//     price: 1200,
//     location: "calangute,goa",
//     country: "india",
//   });
//   await sampleListing.save();
//   console.log("sample is successful");
//   res.send("data is added");
// });

// new route / create route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "new listing is submitted successfully");
    res.redirect("/listings");
  })
);
// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Requested listing does not exist");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);
// edit route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing requested for Edit does not exist");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true }
    );
    res.flash("success", "Update successful");
    res.redirect(`/listings/${id}`);
  })
);
// destroy route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing + " /n this listing is deleted successfully");
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
