
const NewsAPI = require("newsapi");

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

async function fetchNews(preferences = []) {
    const categories = preferences.length
        ? preferences
        : ["technology"];

    const results = await Promise.all(
        categories.map((category) =>
            newsapi.v2.topHeadlines({
                category,
                language: "en",
                country: "us",
            })
        )
    );

    return results.flatMap((response) => response.articles || []);
}

module.exports = { fetchNews };
