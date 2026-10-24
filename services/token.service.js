
const config  = require('../config/env')
const jwt = require('jsonwebtoken')

class TokenService {

    createToken(payload) {
        return jwt.sign(payload, config.JWT_SECRET_TOKEN, {
            algorithm: 'HS256',
            expiresIn: '1h',
            issuer: 'news-aggregator',
        })
    }

}

module.exports = TokenService