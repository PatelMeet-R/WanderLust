const mongoose = require("mongoose");
const passportlocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});
userSchema.plugin(passportlocalMongoose);
 const User = mongoose.model("User", userSchema);
 module.exports = User;