const userModel = require("../models/user.model");
const axios = require("axios");
const { setCache, getCache } = require("../utils/cache");
const newsApi = axios.create({
  baseURL: "https://newsapi.org/v2",
  headers: { "x-api-key": process.env.NEWSAPI_API_KEY },
  timeout: 5000,
});

const getNews = async (req, res) => {
  const id = req.user;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const preferences = user.preferences;
    const cacheddata = getCache(preferences);
    if (cacheddata !== null) {
      return res.json({ news: cacheddata });
    }
    // no preferences -> general top headlines, otherwise search any preference
    const resp =
      preferences.length === 0
        ? await newsApi.get("/top-headlines", { params: { language: "en" } })
        : await newsApi.get("/everything", {
            params: { q: preferences.join(" OR ") },
          });
    setCache(preferences, resp.data.articles);
    res.json({ news: resp.data.articles });
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      console.error("NewsAPI timed out");
      return res.status(504).json({ message: "News service timed out" });
    }
    if (error.response) {
      console.error(
        "NewsAPI error:",
        error.response.status,
        error.response.data,
      );
      return res.status(502).json({ message: "News service unavailable" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getNews };
