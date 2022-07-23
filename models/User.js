const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    bio: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      require: true,
    },
    profilePicture: {
      type: String,
      default: "/public/avatar/default-avatar.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
