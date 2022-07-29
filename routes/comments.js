const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { protected } = require("../helper/protected");
const User = require("../models/User");

// add a comment
router.post("/", protected, async (req, res, next) => {
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
router.get("/:id", protected, async (req, res, next) => {
  try {
    let { page, pageSize } = req.query;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const commentLength = await Comment.find({ postId: req.params.id });
    const comments = await Comment.find({ postId: req.params.id })
      .populate("postedBy", "_id username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    res.send({
      status: "Success",
      message: "Success get a comment",
      data: comments,
      length: commentLength.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
