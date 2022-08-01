const router = require("express").Router();
const Post = require("../models/Post");
const { protected } = require("../helper/protected");
const { uploadPost } = require("../lib/multer");
const Comment = require("../models/Comment");

// Create a post
router.post("/", protected, async (req, res, next) => {
  const { desc, postImage } = req.body;

  const newPost = new Post({
    desc,
    postImage,
    postedBy: req.user.userId,
  });
  try {
    const savedPost = await newPost.save();
    res.send({
      status: "Success",
      message: "Succes Create a post",
      data: savedPost,
    });
  } catch (error) {
    next(error);
  }
});
// delete a post
router.delete("/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await Comment.find({ postId: req.params.id });
    if (!post) throw { message: "Cannot find a post" };
    if (post.postedBy.toString() === req.user.userId) {
      await post.deleteOne({ _id: req.params.id });
      if (comment.length) await Comment.deleteMany({ postId: req.params.id });
      res.send({
        status: "Success",
        message: "Succes delete a post",
      });
    } else {
      throw {
        code: 401,
        message: "Unauthorized",
      };
    }
  } catch (error) {
    next(error);
  }
});
// Update a post
router.patch("/update/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.postedBy.toString() === req.user.userId) {
      const data = await post.updateOne({ $set: req.body });
      if (!data.modifiedCount) throw { message: "Failed to update" };
      res.send({
        status: "Success",
        message: "Succes update a post",
      });
    } else {
      throw {
        code: 401,
        message: "Unauthorized",
      };
    }
  } catch (error) {
    next(error);
  }
});
// Like a post
router.put("/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.send({
        status: "Success",
        message: "The post has been liked",
      });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.send({
        status: "Success",
        message: "The post has been disliked",
      });
    }
  } catch (error) {
    next(error);
  }
});
// get a post
router.get("/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.find({ _id: req.params.id })
      .populate({
        path: "comments",
      })
      .populate("postedBy", "_id username profilePicture");
    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
    });
  } catch (error) {
    next(error);
  }
});
// get all post
router.get("/timeline/all", async (req, res, next) => {
  try {
    let { page, pageSize } = req.query;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const post2 = await Post.find();
    const post = await Post.find()
      .populate("postedBy", "_id username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    if (!post.length) throw { message: "Post not found" };
    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
      length: post2.length,
    });
  } catch (error) {
    next(error);
  }
});
// get liked post
router.get("/timeline/liked", protected, async (req, res, next) => {
  try {
    let { page, pageSize } = req.query;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const post = await Post.find({ likes: { $in: req.user.userId } })
      .limit(limit)
      .skip(offset)
      .populate("postedBy", "_id username profilePicture");
    const post2 = await Post.find({ likes: { $in: req.user.userId } });
    if (!post.length) throw { message: "Post not found" };

    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
      length: post2.length,
    });
  } catch (error) {
    next(error);
  }
});
// get my post
router.get("/timeline/mypost", protected, async (req, res, next) => {
  try {
    let { page, pageSize } = req.query;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const post = await Post.find({ postedBy: req.user.userId })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .skip(offset)
      .populate("postedBy", "_id username profilePicture");
    const post2 = await Post.find({ postedBy: req.user.userId });
    if (!post.length) throw { message: "Post not found" };
    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
      length: post2.length,
    });
  } catch (error) {}
});

// upload post image
router.post(
  "/upload",
  protected,
  uploadPost.single("postImage"),
  (req, res) => {
    try {
      return res.send({
        status: "Success",
        message: "Success upload post image",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
