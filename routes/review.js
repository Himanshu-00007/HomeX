const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { listingschema, reviewschema} = require("../schema.js");
const listing = require("../models/listing.js");
const review = require("../models/review.js");
const reviews=require("../routes/review.js");

const validateReview = (req, res, next) => {
    const { error } = reviewschema.validate(req.body);
    if (error) {
      const errmsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(errmsg, 400);
    }
    next();
  };
router.post("/", validateReview, wrapAsync(async (req, res) => {
    const listings = await listing.findById(req.params.id);
    if (!listings) {
      throw new ExpressError("Listing not found", 404);
    }
    const newreviews = new review(req.body.review);
    newreviews.author = req.user._id; 
    listings.reviews.push(newreviews);
    await listings.save();
    await newreviews.save();
    req.flash("success","New review created!");
    res.redirect(`/listings/${listings._id}`);
  }));
  //delte review route
  router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash("success","Review created!");
    res.redirect(`/listings/${id}`);
  }));
  module.exports=router;