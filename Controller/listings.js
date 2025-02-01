const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  // res.send("this is testing route");
  res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing is submitted successfully");
  res.redirect("/listings");
};
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "reviewcreator",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Requested listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};
module.exports.renderEditForm =async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing requested for Edit does not exist");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }
  module.exports.updateListing =async (req, res, next) => {
      let { id } = req.params;
      await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true }
      );
      req.flash("success", "Update successful");
      res.redirect(`/listings/${id}`);
    }
module.exports.destroyListing =async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing + " /n this listing is deleted successfully");
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}
