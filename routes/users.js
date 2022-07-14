const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("hey its user route");
});

// update user
// delete user
// get a user

module.exports = router;
