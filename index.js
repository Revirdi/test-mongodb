const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(
  () => {
    console.log("Connected to mongoDB");
  },
  (err) => {
    console.log(err);
  }
);

// midleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/users", userRouter);
app.use("/auth", authRouter);

// error handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(8800, () => {
  console.log("API is running");
});
