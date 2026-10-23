const express = require("express");
const { getNews } = require("../controllers/news.controller");
const { isUserAuthorised } = require("../middlewares/auth");
const router = express.Router();

router.get("/", isUserAuthorised, getNews);

module.exports = router;
