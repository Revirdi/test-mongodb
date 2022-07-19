const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { protected } = require("../helper/protected");
const { checkPasswordValidity } = require("../helper");
const validator = require("email-validator");
const { verifyToken } = require("../lib/token.js");
const mongoose = require("mongoose");

// verify user
router.get("/verification/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

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
    console.log(checkUser.isVerified);
    if (!checkUser.isVerified) throw { message: "Failed to validating user" };
    res.send("<h1>Verification success</h1>");
  } catch (error) {
    next(error);
  }
});
// update user
router.put("/:id", protected, async (req, res, next) => {
  if (req.body.password) {
    try {
      const isPasswordValid = checkPasswordValidity(req.body.password);
      if (isPasswordValid)
        throw {
          code: 400,
          message: isPasswordValid,
        };
      const salt = await bcrypt.genSaltSync(10);
      req.body.password = await bcrypt.hashSync(req.body.password, salt);
    } catch (error) {
      next(error);
    }
  }
  if (req.body.email) {
    try {
      if (!validator.validate(req.body.email))
        throw {
          code: 400,
          message: `Please enter a valid email address`,
        };
    } catch (error) {
      next(error);
    }
  }

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
    await User.findByIdAndUpdate(req.user.userId, {
      $set: req.body,
    });
    res.send({
      status: "success",
      message: "Success updating user",
    });
  } catch (error) {
    next(error);
  }
});
// get a user
router.get("/profile", protected, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
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

module.exports = router;
