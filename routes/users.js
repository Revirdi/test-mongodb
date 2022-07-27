const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { protected } = require("../helper/protected");
const { checkPasswordValidity } = require("../helper");
const validator = require("email-validator");
const { verifyToken } = require("../lib/token.js");
const mongoose = require("mongoose");
const { uploadAvatar } = require("../lib/multer");

// verify user
router.get("/verification/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const getUserToken = await User.findOne({ userToken: token });

    if (!getUserToken)
      return res.send(
        "<h2>your code has expired, please use the new code</h2>"
      );

    const verifiedToken = verifyToken(token);

    const checkUser = await User.findByIdAndUpdate(
      verifiedToken.userId,
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );
    if (!checkUser.isVerified) throw { message: "Failed to validating user" };
    res.send("<h2>Verification success</h2>");
  } catch (error) {
    next(error);
  }
});
// update user
router.patch("/", protected, async (req, res, next) => {
  const checkUser = await User.find({ _id: { $ne: req.user.userId } });
  if (checkUser.length) {
    try {
      checkUser.map((c) => {
        if (c.username == req.body.username) {
          throw {
            message: "Username is already exists",
          };
        }
        if (c.email == req.body.email)
          throw { message: "Email is already exists" };
      });
    } catch (error) {
      next(error);
    }
  }
  try {
    await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );

    res.send({
      status: "success",
      message: "Success updating user",
    });
  } catch (error) {
    next(error);
  }
});
// get a user
router.get("/profile/:userId", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const { password, updatedAt, ...other } = user._doc;
    res.send({
      status: "Success",
      message: "Success getting user info",
      data: other,
    });
  } catch (error) {
    next(error);
  }
});
// update user avatar
router.patch(
  "/avatar",
  protected,
  uploadAvatar.single("avatar"),
  async (req, res, next) => {
    try {
      const { filename } = req.file;
      const finalFileName = `/public/avatar/${filename}`;
      const lohe = await User.findByIdAndUpdate(
        req.user.userId,
        {
          profilePicture: finalFileName,
        },
        {
          new: true,
        }
      );
      const { password, updatedAt, ...other } = lohe._doc;

      res.send({
        status: "success",
        message: "Success updating avatar",
        result: other,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
