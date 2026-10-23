
const express = require("express");
const router = express.Router();

const {
    BadRequestErrorResponse,
    ErrorResponse,
} = require("../utils/response");

const { isAuthorized } = require("../middleware/auth.middleware");

const {
    getNews,
    searchNews,
    markArticleAsRead,
    markArticleAsFavorite,
    getReadArticles,
    getFavoriteArticles
} = require("../controller/news.controller");

// GET /news/search/:keyword
router.get("/search/:keyword", isAuthorized, async (req, res) => {
    const userId = req.decodedToken.id;

    try {
        const result = await searchNews(
            userId,
            req.params.keyword,
            req.query
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while searching news')
        );
    }
});

// GET /news/read
router.get("/read", isAuthorized, async (req, res) => {
    try {
        const result = await getReadArticles(
            req.decodedToken.id,
            req.query
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while fetching read articles')
        );
    }
});

// GET /news/favorites
router.get("/favorites", isAuthorized, async (req, res) => {
    try {
        const result = await getFavoriteArticles(
            req.decodedToken.id,
            req.query
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while fetching favorite articles')
        );
    }
});

// GET /news - fetch personalized news.
router.get("/", isAuthorized, async (req, res) => {
    const userId = req.decodedToken.id;

    if (!userId) {
        return res.status(400).json(
            BadRequestErrorResponse('User ID is required')
        );
    }

    try {
        const result = await getNews(userId, req.query);
        return res.status(200).json(
            {
                news: result,
            }
        );
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while fetching news')
        );
    }
});

// POST /news/:id/read
router.post("/:id/read", isAuthorized, async (req, res) => {
    try {
        const article = await markArticleAsRead(
            req.decodedToken.id,
            req.params.id
        );

        return res.status(200).json({ article });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while marking article as read')
        );
    }
});

// POST /news/:id/favorite
router.post("/:id/favorite", isAuthorized, async (req, res) => {
    try {
        const article = await markArticleAsFavorite(
            req.decodedToken.id,
            req.params.id
        );

        return res.status(200).json({ article });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json(
            ErrorResponse(error.message || 'Error occurred while favoriting article')
        );
    }
});

module.exports = {
    newsRoutes: router,
};
