const express = require('express')
const { signup } = require('../controllers/user.controller')
const UserRepository = require('../repositories/user.repository')
const UserService = require('../services/user.service')
const UserController = require('../controllers/user.controller')
const CredentialService = require('../services/credential.service')
const TokenService = require('../services/token.service')
const validateUser = require('../validators/registerUser.validator')
const validateLogin = require('../validators/login.validator')
const { isAuthorized } = require('../middleware/authenticate')

const userRouter = express.Router()

const userRepository = new UserRepository()

const credentialService = new CredentialService()

const tokenService = new TokenService()

const userService = new UserService(userRepository, credentialService, tokenService)

const userController = new UserController(userService)

userRouter.post('/signup', validateUser ,userController.signup)

userRouter.post('/login', validateLogin ,userController.login)

userRouter.get('/preferences', isAuthorized ,userController.getUserPreferences)



module.exports = userRouter