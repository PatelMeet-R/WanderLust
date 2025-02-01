const { render } = require("ejs");
const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();
const userController = require("../Controller/users.js");

router
  .route("/signup")
  .get(wrapAsync(userController.renderSignupForm))
  .post(wrapAsync(userController.signupForm));

router
  .route("/login")
  .get(userController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login
  );
router.route('/logout').get(userController.logout)

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

module.exports = router;
