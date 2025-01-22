const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv").config();
const wrapAsync= require("./utils/wrapAsync");

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
app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("this app is working");
});
// Index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  // res.send("this is testing route");
  res.render("listings/index.ejs", { allListings });
});
// new route / create route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
app.post("/listings",wrapAsync (async(req, res, next) => {
 
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
 
    
  
}));
// Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});
// edit route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { runValidators: true }
  );
  res.redirect(`/listings/${id}`);
});
// destroy route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
});
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
app.use((err, req, res, next) => {
  res.send("something want wrong");
});

app.listen(3030, (req, res) => {
  console.log("app is listening to the port 3030");
});
