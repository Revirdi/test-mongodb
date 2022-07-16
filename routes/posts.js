const router = require("express").Router();
const Post = require("../models/Post");
const { protected } = require("../helper/protected");
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
// Update a post
router.put("/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    // const string = post.postedBy.toString();
    if (post.postedBy.toString() === req.user.userId) {
      await post.updateOne({ $set: req.body });
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
// delete a post
router.delete("/:id", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.postedBy._id === req.user.userId) {
      await post.deleteOne({ $set: req.body });
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
// Like a post
router.put("/:id/like", protected, async (req, res, next) => {
  try {
    const post = await Post.findById(req.body.postId);
    if (!post.likes.includes(req.user.userId)) {
      await post.updateOne({ $push: { likes: req.user.userId } });
      res.send({
        status: "Success",
        message: "The post has been liked",
      });
    } else {
      await post.updateOne({ $pull: { likes: req.user.userId } });
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
    const post = await Post.findById(req.params.id);
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
    const post = await Post.find()
      .populate("postedBy", "_id username")
      .sort({ createdAt: -1 });
    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
    });
  } catch (error) {
    next(error);
  }
});
// get liked post
router.get("/timeline/liked", protected, async (req, res, next) => {
  try {
    const post = await Post.find({ likes: { $in: req.user.userId } }).sort({
      createdAt: -1,
    });

    res.send({
      status: "Success",
      message: "Success get a post",
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
