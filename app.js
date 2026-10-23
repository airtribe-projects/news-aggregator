const dns = require('node:dns');
dns.setServers(['10.166.235.30']);
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const mongoose = require('mongoose');
const dbURI = process.env.MONGODB_URI;
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/news', newsRoutes);

mongoose.connect(dbURI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, (err) => {
            if (err) {
                return console.log('Something bad happened', err);
            }
            console.log(`Server is listening on ${port}`);
        });
    })
    .catch((err) => {console.error('Error connecting to MongoDB:', err);});

module.exports = app;