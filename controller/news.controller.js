
const usersModel = require('../model/user.model');
const newsModel = require('../model/news.model');
const { PAGE_SIZE } = require('../utils/constants');

const NEWS_API_URL = process.env.NEWS_API_URL;

// Validate and normalize pagination parameters.
const getPagination = (query = {}) => {
    const page = Number.parseInt(query.page, 10) || 1;

    if (!Number.isInteger(page) || page < 1) {
        throw new Error('Page must be a positive integer');
    }

    return {
        page,
        pageSize: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE
    };
};

// Fetch articles from NewsAPI.
const fetchNewsFromAPI = async (query, page) => {
    if (!process.env.NEWS_API_KEY) {
        throw new Error('NEWS_API_KEY is missing from environment variables');
    }

    const params = new URLSearchParams({
        q: query,
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sortBy: 'publishedAt',
        language: 'en',
        apiKey: process.env.NEWS_API_KEY
    });

    const response = await fetch(`${NEWS_API_URL}?${params}`);
    const data = await response.json();

    if (!response.ok || data.status !== 'ok') {
        const error = new Error(
            data.message || 'Failed to fetch news from NewsAPI'
        );
        error.statusCode = response.status || 502;
        throw error;
    }

    return data;
};

// Save or update article details without overwriting read/favorite state.
const saveArticles = async (articles) => {
    const validArticles = articles.filter(
        article => article.url && article.title
    );

    return Promise.all(validArticles.map(article =>
        newsModel.findOneAndUpdate(
            { url: article.url },
            {
                $set: {
                    source: article.source || {},
                    author: article.author || null,
                    title: article.title,
                    description: article.description || null,
                    urlToImage: article.urlToImage || null,
                    publishedAt: article.publishedAt || null,
                    content: article.content || null
                },
                $setOnInsert: {
                    url: article.url,
                    readBy: [],
                    favoriteBy: []
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        )
    ));
};

// Return the article data and whether the current user has saved it.
const formatArticles = (articles, userId) => {
    return articles.map(article => ({
        _id: article._id,
        source: article.source,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
        isRead: article.readBy.some(id => id.toString() === userId.toString()),
        isFavorite: article.favoriteBy.some(
            id => id.toString() === userId.toString()
        )
    }));
};

// Build a consistent paginated response.
const buildPaginatedResponse = (articles, totalResults, pagination, userId) => ({
    articles: formatArticles(articles, userId),
    pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalResults,
        totalPages: Math.ceil(totalResults / pagination.pageSize)
    }
});

// GET /news - fetch personalized news using saved user preferences.
const getNews = async (userId, query = {}) => {
    const pagination = getPagination(query);

    const user = await usersModel.findById(userId).select('preferences');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const preferences = (user.preferences || [])
        .map(preference => String(preference).trim())
        .filter(Boolean);

    if (preferences.length === 0) {
        const error = new Error(
            'Please save your news preferences before fetching news'
        );
        error.statusCode = 400;
        throw error;
    }

    // OR lets articles matching any saved preference appear in the feed.
    const searchQuery = `(${preferences.map(preference =>
        `"${preference.replace(/["\\]/g, '')}"`
    ).join(' OR ')})`;

    const data = await fetchNewsFromAPI(searchQuery, pagination.page);
    const articles = await saveArticles(data.articles);

    return buildPaginatedResponse(
        articles,
        data.totalResults,
        pagination,
        userId
    );
};

// GET /news/search/:keyword - search news by keyword.
const searchNews = async (userId, keyword, query = {}) => {
    const pagination = getPagination(query);
    const searchTerm = String(keyword || '').trim();

    if (!searchTerm || searchTerm.length > 200) {
        const error = new Error(
            'Keyword must contain between 1 and 200 characters'
        );
        error.statusCode = 400;
        throw error;
    }

    const data = await fetchNewsFromAPI(searchTerm, pagination.page);
    const articles = await saveArticles(data.articles);

    return buildPaginatedResponse(
        articles,
        data.totalResults,
        pagination,
        userId
    );
};

// Mark an article as read or favorite for the current user.
const updateArticleStatus = async (userId, articleId, field) => {
    if (!['readBy', 'favoriteBy'].includes(field)) {
        throw new Error('Invalid article status field');
    }

    if (!/^[a-f\d]{24}$/i.test(articleId)) {
        const error = new Error('Invalid article ID');
        error.statusCode = 400;
        throw error;
    }

    const article = await newsModel.findByIdAndUpdate(
        articleId,
        { $addToSet: { [field]: userId } },
        { new: true, runValidators: true }
    );

    if (!article) {
        const error = new Error('Article not found');
        error.statusCode = 404;
        throw error;
    }

    return {
        _id: article._id,
        title: article.title,
        url: article.url,
        isRead: article.readBy.some(id => id.toString() === userId.toString()),
        isFavorite: article.favoriteBy.some(
            id => id.toString() === userId.toString()
        )
    };
};

const markArticleAsRead = async (userId, articleId) => {
    return updateArticleStatus(userId, articleId, 'readBy');
};

const markArticleAsFavorite = async (userId, articleId) => {
    return updateArticleStatus(userId, articleId, 'favoriteBy');
};

// Retrieve saved read or favorite articles with pagination.
const getSavedArticles = async (userId, query = {}, field) => {
    const pagination = getPagination(query);

    if (!['readBy', 'favoriteBy'].includes(field)) {
        throw new Error('Invalid article status field');
    }

    const filter = { [field]: userId };

    const [articles, totalResults] = await Promise.all([
        newsModel.find(filter)
            .sort({ publishedAt: -1 })
            .skip(pagination.skip)
            .limit(pagination.pageSize),
        newsModel.countDocuments(filter)
    ]);

    return buildPaginatedResponse(
        articles,
        totalResults,
        pagination,
        userId
    );
};

const getReadArticles = async (userId, query = {}) => {
    return getSavedArticles(userId, query, 'readBy');
};

const getFavoriteArticles = async (userId, query = {}) => {
    return getSavedArticles(userId, query, 'favoriteBy');
};

module.exports = {
    getNews,
    searchNews,
    markArticleAsRead,
    markArticleAsFavorite,
    getReadArticles,
    getFavoriteArticles
};
