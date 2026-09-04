const express = require('express');
const { PORT, NEWS_REFRESH_INTERVAL_MS } = require('./config');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const newsService = require('./services/newsService');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'News Aggregator API' });
});

app.use('/users', userRoutes);
app.use('/news', newsRoutes);
app.use('/', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
    newsService.startPeriodicRefresh(NEWS_REFRESH_INTERVAL_MS);

    app.listen(PORT, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${PORT}`);
    });
}

module.exports = app;
