const express = require('express');
const router = express.Router();
const { getPreferences, setPreferences, getNews } = require('../Controllers/newsController');
router.use(express.json());
const { isAuthorized } = require('../middlewares/auth');

router.get('/preferences', isAuthorized, async (req, res) => {
    try {
        const { id } = req.decodedToken;
        const preference = await getPreferences(id);
        return res.status(200).send({ preference });
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
});

router.post('/preferences', isAuthorized, async (req, res) => {
    try {
        const { id } = req.decodedToken;
        const preference = await setPreferences(id, req.body);
        return res.status(200).send({ preference });
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
})

router.get('/news', isAuthorized, async (req, res) => {
    try {
        const { id } = req.decodedToken;
        const preference = await getPreferences(id);
        const { query, lang, country, max } =  preference;
        console.log(preference, "prefs");
        const news = await getNews(query, lang, country, max);
        res.status(200).send(news);
    }
    catch (error) {
        res.status(error.status || 400).send({ "error": error.message })
    }
});
module.exports = router;