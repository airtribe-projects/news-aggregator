
const { fetchNews } = require("../services/newsService");

const getNews = async (req, res) => {
    try {
        const preferences = req.user.preferences || [];
        const articles = await fetchNews(preferences);

        return res.status(200).json({ news: articles });
    } catch (error) {
        console.error("News API error:", error.message);

        return res.status(502).json({
            message: "Unable to fetch news at the moment",
        });
    }
};

module.exports = { getNews };
