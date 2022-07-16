const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isFieldEmpties, checkPasswordValidity } = require("../helper");
const validator = require("email-validator");
const { createToken } = require("../lib/token");
const { sendMail } = require("../lib/nodemailer");

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const emptyFields = isFieldEmpties({ username, email, password });

    // checking empties fields
    if (emptyFields.length) {
      throw {
        code: 400,
        message: `Empty fields : ${emptyFields}`,
        data: { result: emptyFields },
      };
    }
    // checking email validity
    if (!validator.validate(email))
      throw {
        code: 400,
        message: `Please enter a valid email address`,
      };

    // checking password validity
    const isPasswordValid = checkPasswordValidity(password);
    if (isPasswordValid)
      throw {
        code: 400,
        message: isPasswordValid,
      };

    // checking if username or email is already exist
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      if (checkUser.username == username) {
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
    }

    // hashing password
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // create new user
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    // save user and response
    const user = await newUser.save();
    const token = createToken({ userId: user._id });
    await sendMail({ email, token });
    res.send({
      status: "success",
      message: "Success create new user",
      detail: {
        result: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // !user && res.status(404).send("user not found");
    if (!user) {
      throw {
        code: 404,
        message: "User not found",
      };
    }

    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!comparePassword) {
      const error = new Error("Password is incorect");
      error.code = 400;
      throw error;
    }

    const token = createToken({
      userId: user._id,
      username: user.username,
    });

    res.send({
      status: "Success",
      message: "Login Success",
      data: {
        result: {
          userId: user._id,
          username: user.username,
          accessToken: token,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
