const jwt = require('jsonwebtoken')

// Import .env
require('dotenv').config()

const jwtSign = (data) => {
    return jwt.sign({id: data.id, status: data.status}, process.env.JWT_SECRETKEY)
}

module.exports = jwtSign