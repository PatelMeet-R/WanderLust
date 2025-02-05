const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    filename: String,
    url: { type: String },
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      "trending",
      "rooms",
      "iconic-cities",
      "mountains",
      "castles",
      "amazing-pools",
      "camping",
      "farms",
      "arctic",
      "beach",
      "boat",
      "skiinout",
      "apartment",
      "new",
      "woodlands",
      "lake",
      "cabins",
      "countryside",
      "bedandbreakfasts",
      "campsite",
      "historicalhomes",
    ],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  geometry: {
    type: { type: String, enum: ["Point"], required: true }, // This defines the geometry type
    coordinates: { type: [Number], required: true }, // This defines the coordinates array
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
