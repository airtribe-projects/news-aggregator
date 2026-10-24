
require("dotenv").config();

const usersModel = require("../models/userModel");
const axios = require("axios");

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
    const allNews = [];

    for (const preference of preferences) {
      const response = await axios.get(
        "https://newsapi.org/v2/everything",
        {
          params: {
            q: preference,
            pageSize: 10
          },
          headers: {
            "X-Api-Key": "678c1124633b4dd5ab41a51b8cf9c9b3",
          }
        }
      );

      allNews.push(...response.data.articles);
    }

    return allNews;
  } catch (err) {
    const error = new Error(
      err.response?.data?.message || err.message || "Failed to fetch news"
    );

    error.status = err.response?.status || 500;
    throw error;
  }
};

module.exports = getNewsAsUserPreferences;
