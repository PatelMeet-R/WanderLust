const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../Controller/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
// Index route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.route("/new").get(isLoggedIn, listingController.renderNewForm);
router.route("/search").get(wrapAsync(listingController.search));

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isOwner, isLoggedIn, wrapAsync(listingController.destroyListing));
router
  .route("/:id/reserve")
  .get(isLoggedIn, wrapAsync(listingController.reserve));
router
  .route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
module.exports = router;

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
// router.route("/filter/:filterID").get(wrapAsync(listingController.filter));
