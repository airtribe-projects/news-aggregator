const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const getNewsAsUserPreferences = require("../controller/newsController");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const news = await getNewsAsUserPreferences(req.userId);
    return res.status(200).json({ news });
  } catch (err) {
    const status = err.status || 500;

    if (status >= 500) {
      return res.status(status).json({
        error: "Internal server error",
      });
    }

    return res.status(status).json({
      error: err.message,
    });
  }
});

module.exports = router;
