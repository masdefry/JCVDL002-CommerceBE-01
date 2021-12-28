const express = require('express')
const Router = express.Router()

// Import Controller
const UserController = require('../Controllers/UserController')
const AuthController = require('../Controllers/AuthController')
const ProductController = require('../Controllers/ProductController')
// Import JWTVerify 
const jwtVerify = require('./../Middleware/JWTVerify')

// Routing
Router.post('/register', UserController.register)
Router.post('/login', AuthController.login)
Router.patch('/changePassword', jwtVerify, UserController.changePassword)
Router.patch('/forgotPassword',  UserController.changePassword)
Router.get('/profile', jwtVerify, UserController.getUserProfile)
Router.post('/sendEmail', UserController.sendEmailLink)
Router.get('/verifyEmail', UserController.verifyEmail)
Router.post('/updateUser',jwtVerify, UserController.updateUser)
Router.post('/createAddress',jwtVerify, UserController.createAddress)
Router.get('/getCurrentAddress',jwtVerify, UserController.getCurrentAddress)
Router.patch('/updateDeafultAddress',jwtVerify, UserController.updateDeafultAddress)
Router.get('/getProducts', ProductController.getProducts)
module.exports = Router