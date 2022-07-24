const multer = require("multer");
const path = require("path"); // built-in
const appRoot = require("app-root-path");

const avatarPath = path.join(appRoot.path, "public", "avatar");
const postPath = path.join(appRoot.path, "public", "post");

const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarPath);
  },
  filename: function (req, file, cb) {
    const { username } = req.user;
    cb(null, `${username}-avatar.png`);
  },
});

const storagePost = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postPath);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: {
    fileSize: 10485760, // Byte, 10 MB
  },
  fileFilter(req, file, cb) {
    const allowedExtension = [".png", ".jpg", ".jpeg"];

    const extname = path.extname(file.originalname);

    if (!allowedExtension.includes(extname)) {
      const error = new Error("Please upload image file (jpg, jpeg, png)");
      return cb(error);
    }

    cb(null, true);
  },
});

const uploadPost = multer({ storage: storagePost });

module.exports = { uploadAvatar, uploadPost };
