const { render } = require("ejs");
const express = require("express");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();

router.get(
  "/signup",
  wrapAsync(async (req, res) => {
    res.render("Users/signup.ejs");
  })
);
// app.get("/demouser", async (req, res) => {
//   try {
//     let registeredUser = await User.register(
//       { email: "temp@gmail.com", username: "temp1" },
//       "mypassword"
//     );
//     res.send(registeredUser); // Send the registered user
//   } catch (e) {
//     res.status(500).send(e); // Handle errors
//   }
// });

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      let newUser = { username, email };
      const registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "You have Registered");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      +res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("Users/login.ejs");
});
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome back to wanderlust ! you are login in !!");
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
  }
);
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    return next(err);
  });
  req.flash("success", "your are logged out !");
  res.redirect("/listings");
});
module.exports = router;
