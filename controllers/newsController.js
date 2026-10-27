const axios = require('axios');
const { users, newsCache } = require('../data/store');

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

exports.getNews = async (req, res) => {
  let query = 'india';
  try {
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    query = user.preferences.length ? user.preferences.join(' OR ') : 'india';

    const cached = newsCache[query];

    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return res.status(200).json({ news: cached.data, cached: true });
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: { q: query, pageSize: 20, apiKey: process.env.NEWS_API_KEY },
    });

    newsCache[query] = { data: response.data.articles, time: Date.now() };
    res.status(200).json({ news: response.data.articles, cached: false });
  } catch (e) {
    const stale = newsCache[query];
    if (stale) return res.status(200).json({ news: stale.data, cached: true });
    return res.status(502).json({ message: 'Failed to fetch news from external API' });
  }
};