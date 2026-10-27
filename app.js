require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersRoutes = require('./routes/users');
const newsRoutes = require('./routes/news');

app.use('/users', usersRoutes); 
app.use('/', usersRoutes);     
app.use('/news', newsRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;