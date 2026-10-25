const express = require("express");
const { getNews } = require("../controllers/newsController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getNews);
module.exports = router;