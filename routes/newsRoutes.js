const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, (req, res) => {
  return res.status(200).json({
    news: [],
  });
});

module.exports = router;
