require('dotenv').config({ quiet: true });

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    SALT_ROUNDS: 10,
    NEWS_API_URL: process.env.NEWS_API_URL || 'https://newsapi.org/v2/everything',
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
    NEWS_LANGUAGE: process.env.NEWS_LANGUAGE || 'en',
    NEWS_PAGE_SIZE: Number(process.env.NEWS_PAGE_SIZE) || 20,
    NEWS_REQUEST_TIMEOUT_MS: Number(process.env.NEWS_REQUEST_TIMEOUT_MS) || 8000,
    NEWS_CACHE_TTL_MS: Number(process.env.NEWS_CACHE_TTL_MS) || 5 * 60 * 1000,
    NEWS_REFRESH_INTERVAL_MS: Number(process.env.NEWS_REFRESH_INTERVAL_MS) || 10 * 60 * 1000,
};
