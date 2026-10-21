require("dotenv").config();

const usersModel = require("../models/userModel");
const NewsAPI = require("newsapi");

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

const getNewsAsUserPreferences = async (id) => {
  const user = await usersModel.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const preferences = user.preferences || [];

  if (preferences.length === 0) {
    return [];
  }

  try {
    const responses = await Promise.all(
      preferences.map((category) =>
        newsapi.v2.topHeadlines({
          country: "us",
          category: category,
        }),
      ),
    );

    return responses.flatMap((response) => response.articles || []);
  } catch (err) {
    const error = new Error(err.message || "Failed to fetch news");
    error.status = 500;
    throw error;
  }
};

module.exports = getNewsAsUserPreferences;
