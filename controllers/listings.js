const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
      populate: {
        path: "author",
      }
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");  
    }
    console.log(listing)
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {
  try {
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
      .send();

    const data = req.body.listing;

    const newListing = new Listing({
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      country: data.country,
      owner: req.user._id,
      image: {
        url: req.file.path,
        filename: req.file.filename
      },
      geometry: geoResponse.body.features[0].geometry
    });

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Could not create listing");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");  
    }
  res.render("listings/edit.ejs", { listing });
}

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  // update basic fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // re-geocode ONLY if location changed
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: listing.location,
      limit: 1
    })
    .send();

  if (geoResponse.body.features.length) {
    listing.geometry = geoResponse.body.features[0].geometry;
  }

  // update image if new one uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}