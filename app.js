require('dotenv').config();
const express = require('express');
const { connectDb } = require('./db/connect');
const { startNewsCacheRefresh } = require('./cache/newsCache');

const app = express();
const port = 3000;
const isServer = require.main === module;

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use('/users', require('./routes/users'));
app.use('/news', require('./routes/news'));

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON' });
    }

    return res.status(500).json({ message: 'Internal server error' });
});

const initPromise = connectDb({ isServer }).then(() => {
    if (isServer) {
        app.listen(port, (err) => {
            if (err) {
                return console.log('Something bad happened', err);
            }
            console.log(`Server is listening on ${port}`);
            startNewsCacheRefresh();
        });
    }
});

module.exports = app;
module.exports.initPromise = initPromise;
