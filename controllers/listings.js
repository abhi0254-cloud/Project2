
const Listing =require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { query } = require("../routes/user");
const mapToken=process.env.Map_TOKEN;
const geocodingClient = mbxGeocoding({accessToken:mapToken});

module.exports.index=async (req,res) =>{
  const allListings=await Listing.find({});
  res.render("index.ejs",{allListings});  
};

module.exports.renderNewForm= (req,res) =>{
    res.render("new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id} =req.params;
    const listing=await Listing.findById(id)
    .populate( {path:"reviews", 
     populate:{
          path:"author",
    },
   })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("show.ejs",{listing});
   };

         

   module.exports.createListing=async(req,res,next)=>{
      let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit:1,
      })
      .send();

    let url = req.file.path;
    let filename= req.file.filename;
     const  newListing=new Listing(req.body.listing);
     newListing.owner =req.user._id;
      newListing.image={url,filename};
      
      newListing.geometry=response.body.features[0].geometry;

     let savedListing= await newListing.save();
     console.log(savedListing);
     req.flash("success","New Listing is created");
     res.redirect("/listings");
     next();
   
    };
     
    module.exports.renderEditForm=async (req,res) =>{
        let {id} =req.params;
        const listing=await Listing.findById(id);
          req.flash("success","Listing Edited");
          
          let originalImageUrl=listing.image.url;
         originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
        res.render("edit.ejs",{listing,originalImageUrl});

    };

    module.exports.updateListing=async(req,res) =>{
        let {id} =req.params;
        // let listing= await Listing.findById(id);
        let listing= await Listing.findByIdAndUpdate(id,{ ...req.body.listing });
           
        if(typeof req.file !=="undefined"){
           let url = req.file.path;
           let filename= req.file.filename;
           listing.image={url,filename};
           await listing.save();
        } 
         req.flash("success","Listing Updated");
         res.redirect(`/listings/${id}`);
    };

    module.exports.deleteListing=async(req,res) =>{
        let {id}=req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
          req.flash("success"," Listing Deleted");
        res.redirect("/listings");
    };