const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingschema } = require("../schema.js");
const listing = require("../models/listing.js");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

// Validation Middleware
const validateListing = (req, res, next) => {
  const { error } = listingschema.validate(req.body);
  if (error) {
    const errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errmsg, 400);
  }
  next();
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
  const alllistings = await listing.find({});
  res.render("listings/index.ejs", { alllistings });
}));

// New Route
router.get("/new", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
  }
  res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const list = await listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }  
    })
    .populate("owner");
  if (!list) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { list });
}));

// Create Route
router.post("/", validateListing, wrapAsync(async (req, res) => {
  const { title, description, image, price, location, country } = req.body;
  const newListing = new listing({ title, description, image, price, location, country });
  newListing.owner=req.user._id;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to edit a listing");
    return res.redirect("/login");
  }
  const { id } = req.params;
  const list = await listing.findById(id);
  if (!list) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { list });
}));

// Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to update a listing");
    return res.redirect("/login");
  }
  const { id } = req.params;
  const { title, description, image, price, location, country } = req.body;
  const list = await listing.findByIdAndUpdate(id, { title, description, image, price, location, country });
  if (!list) {
    throw new ExpressError("Listing not found", 404);
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to delete a listing");
    return res.redirect("/login");
  }
  const { id } = req.params;
  const list = await listing.findByIdAndDelete(id);
  if (!list) {
    throw new ExpressError("Listing not found", 404);
  }
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}));

module.exports = router;
