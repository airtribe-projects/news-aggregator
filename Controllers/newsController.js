const fetchNews = require('../Modals/newsModal');
const userModal = require('../Modals/userModals');

const DEFAULT_QUERY = 'top news';



const getPreferences = async (userId) => {

    const dbUser = await userModal.findById(userId).select('preference');

    if (!dbUser) {
        throw new Error('User not found');
    }

    return dbUser.preference;
}

const setPreferences = async (userId, body) => {
    const { query, lang, country, max } = body
    const dbUser = await userModal.findByIdAndUpdate(
        userId,
        { $set: { preference: { query, lang, country, max } } },
        { new: true, runValidators: true }
    );

    if (!dbUser) {
        throw new Error('User not found');
    }

    return dbUser.preference;
}

const getNews = async (query, lang, country, max) => {
    return await fetchNews(query || DEFAULT_QUERY, lang, country, max);
}

module.exports = { getPreferences, setPreferences, getNews }