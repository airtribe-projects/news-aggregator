const { fetchArticles, findCachedArticle } = require('../models/newsModel');
const { readAll, writeAll } = require('../models/userModel');
const { getPreferences } = require('./userController');
const { createError } = require('../utils/createError');

const getNewsForUser = async (userId) => {
    const preferences = await getPreferences(userId);

    // No preferences means nothing to search for
    if (preferences.length === 0) {
        return [];
    }

    // Quotes keep multi-word preferences like "video games" together
    const query = preferences.map((pref) => `"${pref}"`).join(' OR ');
    return fetchArticles(query);
};

const searchNews = async (keyword) => {
    return fetchArticles(keyword.trim().toLowerCase());
};

// listName is 'readArticles' or 'favoriteArticles'
const saveArticle = async (userId, articleId, listName) => {
    const article = findCachedArticle(articleId);
    if (!article) {
        throw createError(404, 'Article not found, fetch the news first');
    }

    const users = await readAll();
    const user = users.find((user) => user.id === userId);
    if (!user) {
        throw createError(404, 'User not found');
    }

    // Older users might not have this list yet
    user[listName] = user[listName] || [];
    if (!user[listName].find((saved) => saved.id === articleId)) {
        user[listName].push(article);
        await writeAll(users);
    }
    return article;
};

const getSavedArticles = async (userId, listName) => {
    const users = await readAll();
    const user = users.find((user) => user.id === userId);
    if (!user) {
        throw createError(404, 'User not found');
    }
    return user[listName] || [];
};

const markAsRead = (userId, articleId) => saveArticle(userId, articleId, 'readArticles');
const markAsFavorite = (userId, articleId) => saveArticle(userId, articleId, 'favoriteArticles');
const getReadArticles = (userId) => getSavedArticles(userId, 'readArticles');
const getFavoriteArticles = (userId) => getSavedArticles(userId, 'favoriteArticles');

module.exports = {
    getNewsForUser,
    searchNews,
    markAsRead,
    markAsFavorite,
    getReadArticles,
    getFavoriteArticles,
};
