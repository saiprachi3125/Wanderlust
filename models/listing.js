
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,

  image: {
    url: String,
    filename: String,
  },

  location: String,
  country: {
    type: String,
    required: true
  },

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
    type: String,
    enum: ["Point"],
    required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

module.exports = mongoose.model("Listing", listingSchema);
