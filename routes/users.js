const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { protected } = require("../helper/protected");
const { checkPasswordValidity } = require("../helper");
const validator = require("email-validator");

// update user
router.put("/:id", protected, async (req, res, next) => {
  if (req.user.userId === req.params.id) {
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
    const checkUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
      $ie: req.user.userId,
    });
    if (checkUser) {
      try {
        if (checkUser.username == req.body.username) {
          throw {
            code: 400,
            message: "Username is already exists",
          };
        } else {
          throw {
            code: 400,
            message: "Email is already exists",
          };
        }
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
  } else {
    const error = new Error("Unauthorized");
    error.code = 401;
    next(error);
  }
});
// get a user
router.get("/:id", protected, async (req, res, next) => {
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
