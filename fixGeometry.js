require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

const geocoder = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

(async () => {
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { geometry: null }
    ]
  });

  console.log(`Found ${listings.length} listings to fix`);

  for (let listing of listings) {
    const response = await geocoder.forwardGeocode({
      query: listing.location,
      limit: 1,
    }).send();

    listing.geometry = response.body.features[0].geometry;
    await listing.save();

    console.log("Updated:", listing.title);
  }

  mongoose.connection.close();
})();
