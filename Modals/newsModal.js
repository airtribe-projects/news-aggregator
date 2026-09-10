const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const apiURL = process.env.NEWS_API_BASE_URL;

const fetchNews = async (query = "", lang, country = "", max = 100) => {
    try {
        const response = await axios.get(apiURL, {
            params: {
                q: query,
                apikey: NEWS_API_KEY,
                ...(lang ? { lang } : {}),
                ...(country ? { country } : {}),
                ...(max ? { max } : {})
            }
        });
        return response.data;
    }
    catch (error) {
        const status = error.response?.status;
        console.error('News API failed:', status, error.response?.data);

        const err = new Error(
            status === 429
                ? 'News service rate limit reached, please try again later'
                : 'Could not fetch news right now'
        );
        err.status = status === 429 ? 429 : 502;
        throw err;
    }
}

module.exports = fetchNews;
