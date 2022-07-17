const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const PostSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
    },
    postImage: {
      type: String,
      default: "No Image",
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [
      {
        type: ObjectId,
        ref: "Comment",
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
