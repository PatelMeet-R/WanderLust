const User = require("../models/user");
module.exports.renderSignupForm = async (req, res) => {
  res.render("Users/signup.ejs");
};
module.exports.signupForm = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = await User.register({ username, email }, password);
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have Registered");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};
module.exports.renderLogin = (req, res) => {
  res.render("Users/login.ejs");
};
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to wanderlust ! you are login in !!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    return next(err);
  });
  req.flash("success", "your are logged out !");
  res.redirect("/listings");
};
