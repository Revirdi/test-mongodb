const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bearerToken = require("express-bearer-token");

// import Router
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");

// Connecting to mongoDB
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
app.use(cors());
app.use(bearerToken());
app.use("/public", express.static("public"));
app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

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
