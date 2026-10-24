
const axios = require('axios');

const { getUserPreferences } = require('./userService');

const getPersonalizedNews = async (userId) => {
    // Retrieve preferences of the logged-in user
    const preferences = getUserPreferences(userId);

    // If no preferences are selected, return empty news
    if (preferences.length === 0) {
        return [];
    }

    // Ensure external API key is configured
    if (!process.env.NEWS_API_KEY) {
        throw new Error('News API key is not configured');
    }

    // Combine user preferences into search query
    const query = preferences.join(' OR ');

    try {
        // Fetch news from external provider
        const response = await axios.get(
            'https://newsapi.org/v2/everything',
            {
                params: {
                    q: query,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 20,
                    apiKey: process.env.NEWS_API_KEY
                },
                timeout: 10000
            }
        );

        return response.data.articles || [];

    } catch (error) {
        const apiError = new Error('Unable to fetch news');
        apiError.statusCode = 502;
        throw apiError;
    }
};

module.exports = {
    getPersonalizedNews
};
