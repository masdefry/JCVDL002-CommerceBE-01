const express = require('express')
const Router = express.Router()

// Import Controller
const UserController = require('./../Controllers/Controller')

// Import JWTVerify 
const jwtVerify = require('./../Middleware/JWTVerify')

// Routing
Router.post('/register', UserController.register)
Router.post('/login', UserController.login)
Router.patch('/changePassword', jwtVerify, UserController.changePassword)
Router.get('/profile', jwtVerify, UserController.getUserProfile)
module.exports = Router