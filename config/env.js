const dotenv = require('dotenv')

dotenv.config({path: './.env'})


const {JWT_SECRET_TOKEN, DB_URL, NEWS_API_KEY} = process.env

 const Config = {
JWT_SECRET_TOKEN,
 DB_URL,
 NEWS_API_KEY
}

module.exports = Config