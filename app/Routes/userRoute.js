
const express = require('express')
const userController = require('../Controllers/userController')
const userAuths = require('../Middlewares/userAuth')
const { saveUser, authenticate} = userAuths
const { signup, login, getAllUsers, editUser } = userController

const router = express.Router()

router.get('/', getAllUsers )
router.post('/signup', saveUser, signup)
router.post('/login', login )
router.put('/edit', authenticate, editUser )

module.exports = router