if(process.env.NODE_ENV !="production") {
    require("dotenv").config();
}

// console.log(process.env.SECRET);

const express= require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");

const session=require("express-session");
const MongoStore = require("connect-mongo").default;

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const User=require("./models/user.js");

const multer=require('multer');
const {storage} = require("./cloudConfig.js");
const upload=multer({storage});


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const dbUrl=process.env.ATLASDB_URL;

main()
.then(() =>{
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});



async function main() {
   await mongoose.connect(dbUrl);

//   await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));




const store =MongoStore.create({
   mongoUrl:dbUrl,
   crypto:{
    secret:process.env.SECRET,
   },
   touchAfter :24*3600,  //for lazy update
});

store.on("error",()=>{
    console.log("Error in Mongo store",err);
});

const sessionOption={ 
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookies:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true

    }
};

// app.get("/",(req,res)=>{
//     res.send("Hi I am ABHI!");
// });


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  console.log(res.locals.success);
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@12gmail.com",
//         username:"delta-student"
//     });

//   let registeredUser= await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);

// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.get("/{*path}",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"));
});

app.use((err,req,res,next) =>{
    let {status=500,message="Something is wrong!"}=err; 
    res.status(status).render("error.ejs",{message});
});

app.listen("8080",()=>{
    console.log("Server i listening to port 8080 ");
});
