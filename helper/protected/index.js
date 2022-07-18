const { verifyToken } = require("../../lib/token");
const User = require("../../models/User");

const protected = async (req, res, next) => {
  try {
    const token = req.token;
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const verifiedToken = verifyToken(token);
    req.user = {
      userId: verifiedToken.userId,
      username: verifiedToken.username,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protected };
