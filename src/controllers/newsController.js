
const {
    getPersonalizedNews
} = require('../services/newsService');

const getNews = async (req, res, next) => {
    try {
        // Get authenticated user ID from JWT
        const userId = req.user.id;

        // Fetch personalized news using service layer
        const news = await getPersonalizedNews(userId);

        // Return news response
        return res.status(200).json({
            news
        });

    } catch (error) {
        // Forward errors to centralized error handler
        next(error);
    }
};

module.exports = {
    getNews
};
