const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { protected } = require("../helper/protected");
const User = require("../models/User");

// add a comment
router.put("/", protected, async (req, res, next) => {
  try {
    const { text, postId } = req.body;
    const newComment = new Comment({
      text,
      postId,
      postedBy: req.user.userId,
    });
    const savedComment = await newComment.save();

    const post = await Post.findById(postId);
    await post.updateOne({ $push: { comments: savedComment } }, { new: true });
    res.send({
      status: "Success",
      message: "Succes Comment a post",
      data: savedComment,
    });
  } catch (error) {
    next(error);
  }
});

// get a comment
router.get("/", protected, async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.body.postId })
      .populate("postedBy")
      .sort({ createdAt: -1 });
    res.send({
      status: "Success",
      message: "Success get a comment",
      data: comments,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
