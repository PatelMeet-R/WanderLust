const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing");
const Review = require("./models/reviews.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv").config();
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./Schema.js");
const { ReviewSchema } = require("./Schema.js");
let main = async () => {
  let mongoUrl = process.env.DATABASE_URL;
  await mongoose.connect(mongoUrl);
};
main()
  .then((data) => {
    console.log("mongoDB is connection successful");
  })
  .catch((err) => {
    console.log(err);
  });
app.set("views engines", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("this app is working");
});

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

// Index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // res.send("this is testing route");
    res.render("listings/index.ejs", { allListings });
  })
);
// new route / create route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);
// Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);
// edit route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true }
    );
    res.redirect(`/listings/${id}`);
  })
);
// destroy route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing + " /n this listing is deleted successfully");
    res.redirect("/listings");
  })
);
// reviews Route
// post review route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved", newReview);
    res.redirect(`/listings/${listing._id}`);
  })
);

// destroy review route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

// samplelisting route
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

// middleware
app.all("*", (err, req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err; // Add default message
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(3030, (req, res) => {
  console.log("app is listening to the port 3030");
});
