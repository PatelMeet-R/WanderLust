const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  let originalSet = allListings;
  // res.send("this is testing route");
  res.render("listings/index.ejs", { allListings, originalSet });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 2,
    })
    .send();

  let filename = req.file.filename;
  let url = req.file.path;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.category = req.body.category;
  newListing.image = { filename, url };
  const geometry = response.body.features[0].geometry;
  newListing.geometry = {
    type: "Point", // GeoJSON type
    coordinates: geometry.coordinates, // Coordinates from Mapbox response
  };
  let savedListing = await newListing.save();

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
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing requested for Edit does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};
module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;

  let existingListing = await Listing.findById(id);

  let updatedListingData = { ...req.body.listing };

  // If location is updated, geocode the new location to update geometry
  if (updatedListingData.location !== existingListing.location) {
    let response = await geocodingClient
      .forwardGeocode({
        query: updatedListingData.location,
        limit: 2,
      })
      .send();
    const geometry = response.body.features[0].geometry;
    updatedListingData.geometry = {
      type: "Point",
      coordinates: geometry.coordinates,
    };
  } else {
    // If location hasn't changed, retain the existing geometry
    updatedListingData.geometry = existingListing.geometry;
  }
  let editListing = await Listing.findByIdAndUpdate(id, updatedListingData, {
    runValidators: true,
    new: true,
  });

  // Handle image update if a new image is uploaded
  if (req.file) {
    let filename = req.file.filename;
    let url = req.file.path;
    editListing.image = { url, filename };
    await editListing.save();
  }

  req.flash("success", "Update successful");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing + " /n this listing is deleted successfully");
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

// module.exports.filter = async (req, res) => {
//   const filterID = req.params.filterID;

//   const isFilterIdCorrect = [
//     "trending",
//     "rooms",
//     "iconic-cities",
//     "mountains",
//     "castles",
//     "amazing-pools",
//     "camping",
//     "farms",
//     "arctic",
//   ];

//   if (!isFilterIdCorrect.includes(filterID)) {
//     req.flash("error", "Invalid filterID");
//     return res.redirect("/listings");
//   }

//   const filteredListings = await Listing.find({ category: filterID });
//   return res.render("listings/index.ejs", { allListings: filteredListings });
// };

module.exports.search = async (req, res) => {
  let input = req.query.q;
  let query = input ? input.trim() : "";

  if (query === "") {
    req.flash("error", "Please enter a search query!");
    return res.status(404).redirect("/listings");
  }

  let searchQuery = new RegExp(query, "i");

  const searchList = await Listing.find({
    $or: [
      { title: searchQuery },
      { location: searchQuery },
      { country: searchQuery },
    ],
  });
  if (searchList.length === 0) {
    req.flash("error", "No listings found based on your search");
    return res.redirect("/listings");
  }

  return res.status(200).render("listings/index.ejs", {
    allListings: searchList,
    originalSet: searchList,
    input,
  });
};
module.exports.reserve = async (req, res) => {
  let { id } = req.params;
  req.flash(
    "success",
    "You have Reserved ,We send further details in your email "
  );
  res.redirect(`/listings/${id}`);
};
