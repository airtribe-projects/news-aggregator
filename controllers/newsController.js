const UserModel = require('../models/User');

async function getNews(req, res) {
    try{
        const userId = req.user.id;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const preferences = user.preferences;

        if (preferences.length === 0) {
            return res.status(200).json({ message: 'No preferences set', news: [] });
        }

        const apiKey = process.env.NEWS_API_KEY;
        const allNews = [];
        for (const preference of preferences) {
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(preference)}&pageSize=10`;
            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`NewsAPI request failed: ${response.status}`);
            }
            const data = await response.json();
            if(data.status !== 'ok') {
                throw new Error(`NewsAPI returned an error: ${data.message}`);
            }
            if (data.articles) {
                const articles = data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url
            }));
                allNews.push(...articles);
            }  
        }
        const uniqueNews = new Map(allNews.map(article => [article.url, article]));
        const news = [...uniqueNews.values()];
        return res.status(200).json({ news });
    } catch (error) {
        console.error('Error fetching news:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getNews };