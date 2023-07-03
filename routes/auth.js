const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isFieldEmpties, checkPasswordValidity } = require("../helper");
const validator = require("email-validator");
const { createToken } = require("../lib/token");
const { sendMail } = require("../lib/nodemailer");
const { protected } = require("../helper/protected");

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    const emptyFields = isFieldEmpties({
      username,
      email,
      password,
      confirm_password,
    });

    // checking empties fields
    if (emptyFields.length) {
      throw {
        code: 400,
        message: `Empty fields : ${emptyFields}`,
        data: { result: emptyFields },
      };
    }

    // checking if username or email is already exist
    const checkUser = await User.findOne({ $or: [{ email }, { username }] });
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
    // checking email validity
    if (!validator.validate(email))
      throw {
        code: 400,
        message: `Please enter a valid email address`,
      };

    // Comfirm password
    if (password !== confirm_password)
      throw { code: 400, message: "Password did not match" };

    // checking password validity
    const isPasswordValid = checkPasswordValidity(password);
    if (isPasswordValid)
      throw {
        code: 400,
        message: isPasswordValid,
      };

    // hashing password
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // create new user
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    // save user to mongo
    const user = await newUser.save();

    // create token
    const token = createToken({ userId: user._id });

    const getUser = await User.findByIdAndUpdate(
      user._id,
      {
        userToken: token,
      },
      {
        new: true,
      }
    );

    // Sending to email
    await sendMail({ email, token: getUser.userToken });

    // response for FE
    res.send({
      status: "success",
      message: "Success create new user",
      detail: {
        result: getUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.formLogin }, { username: req.body.formLogin }],
    });
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
      const error = new Error("Email / Password is incorect");
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

// resend email
router.post("/verify", async (req, res, next) => {
  const { email, userId } = req.body;
  const token = createToken({ userId, email });
  const user = await User.findByIdAndUpdate(
    userId,
    { userToken: token },
    {
      new: true,
    }
  );
  await sendMail({ email, token: user.userToken });
  res.send({
    status: "success",
    message: "Success sending email",
  });
});
module.exports = router;
