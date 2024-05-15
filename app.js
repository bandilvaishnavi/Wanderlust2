const express=require("express");
const app=express();
const Listing=require("./models/listing.js");
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
app.use(methodOverride("_method"));
const ejsmate=require("ejs-mate");
const Review=require("./models/review.js");
const wrapAsync=require("./utils/WrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const WrapAsync = require("./utils/WrapAsync.js");

main()
  .then(()=>{console.log("connection is built");})
  .catch((err)=>{console.log(err)});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.get("/",(req,res)=>{
    res.send("hi i am root..");
});
app.engine("ejs",ejsmate);
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
/*pp.get("/testlisting",async(req,res)=>{s
  let sample=new Listing({
    title:"my new villa",
    description:"by the beach",
    price:1200,
    location:"calangute,goa",
    country:"india",
  })
  await sample.save();
  console.log("sample was saved");
  res.send("successful");
});*/

/*app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
})*/

//index route
app.get("/listings",
   Wrapasync(async (req,res)=>{
    const alllistings=await Listing.find({});
    res.render("./listings/index.ejs",{alllistings});

}));

//new route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs")
});

//show route
app.get("/listings/:id",
  Wrapasync(async(req,res)=>{
  let{id}=req.params;
  const listing=await Listing.findById(id);
  res.render("listings/show.ejs",{listing});
}));

//create route
app.post("/listings",
    WrapAsync(async(req,res,next)=>{
  
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
app.get("/listings/:id/edit",
   Wrapasync(async(req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  res.render("listings/edit",{listing});
}));

//update route
app.put("/listings/:id",
  Wrapasync(async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndUpdate(id,req.body.listing);
  res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id",
  Wrapasync(async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

//reviews
//post route
app.post("/listings/:id/reviews",
    WrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));
//error handling
app.use((err,req,res,next)=>{
  let {statusCode,message}=err;
  res.status(statusCode).send(message);
});
app.listen(8080,()=>{
    console.log("app is listening to port 8080");
});
