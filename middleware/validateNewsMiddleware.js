const ARTICLE_ID_REGEX = /^[a-f0-9]{16}$/;
const MAX_KEYWORD_LENGTH = 100;

const validateArticleId = (req, res, next) => {
    if (!ARTICLE_ID_REGEX.test(req.params.id)) {
        return res.status(400).json({ message: 'Invalid article id' });
    }
    next();
};

const validateKeyword = (req, res, next) => {
    const keyword = req.params.keyword.trim();

    if (keyword === '') {
        return res.status(400).json({ message: 'Search keyword is required' });
    }
    if (keyword.length > MAX_KEYWORD_LENGTH) {
        return res.status(400).json({ message: `Search keyword must be at most ${MAX_KEYWORD_LENGTH} characters` });
    }
    next();
};

module.exports = { validateArticleId, validateKeyword };
