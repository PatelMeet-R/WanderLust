const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv").config();
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

let main = async () => {
  let mongoUrl = process.env.DATABASE_URL;
  await mongoose.connect(mongoUrl);
};

const sessionOption = {
  resave: false,
  secret: "password",
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 24 * 60 * 60 * 7,
    maxAge: 1000 * 24 * 60 * 60 * 7,
  },
};
app.use(session(sessionOption));
app.use(flash());
app.set("views engines", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("this app is working");
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.all("*", (err, req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err; // Add default message
  res.status(statusCode).render("error.ejs", { message });
});

main()
  .then((data) => {
    app.listen(3030, (req, res) => {
      console.log("app is listening to the port 3030");
    });
    console.log("mongoDB is connection successful");
  })
  .catch((err) => {
    console.log(err);
  });
