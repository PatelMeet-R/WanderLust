const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv").config();
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

let main = async () => {
  let mongoUrl = process.env.DATABASE_URL;
  await mongoose.connect(mongoUrl);
};
app.set("views engines", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

const sessionOption = {
  resave: false,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 24 * 60 * 60 * 7,
    maxAge: 1000 * 24 * 60 * 60 * 7,
  },
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.send("this is working Route");
});
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.all("*", (err, req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err; // Add default message
  res.status(statusCode).render("error.ejs", { message });
});

main()
  .then((data) => {
    console.log("mongoDB is connection successful");
    app.listen(3030, (req, res) => {
      console.log("app is listening to the port 3030");
    });
  })
  .catch((err) => {
    console.log(err);
  });
