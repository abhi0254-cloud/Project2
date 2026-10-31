const express=require("express");
const router=express();
const wrapasync = require("../utils/wrapasync.js");
const Listing=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js");
const {isLoggedIn, isOwner,validateListing,validateReview}=require("../middleware.js");

const multer=require('multer');
const {storage} = require("../cloudConfig.js");
const upload=multer({storage});

const listingController=require("../controllers/listings.js");

// Index Route
router.get("/",wrapasync(listingController.index));

// New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

// Show Route
router.get("/:id",wrapasync(listingController.showListing));

// Create Route
router.post("/",
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing ,
    wrapasync(listingController.createListing)
);



// Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapasync(listingController.renderEditForm));

// Update route
router.put("/:id",
    isLoggedIn,
    isOwner,
     upload.single('listing[image]'),
    validateListing,
    wrapasync(listingController.updateListing));

// Delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapasync(listingController.deleteListing));


module.exports=router;