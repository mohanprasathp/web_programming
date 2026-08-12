const express = require('express')
const authController = require('../controllers/authController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/login', authController.login)
router.post('/verify-otp', authController.verifyOTP)
router.post('/refresh-token', auth, authController.refreshToken)

module.exports = router
