const User = require('../models/User')
const { generateOTP, hashOTP, generateToken, verifyOTP } = require('../utils/auth')

// Mock OTP storage (in production, use SMS service like Twilio)
const otpStore = {}

exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body

    if (!employeeId || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required' })
    }

    const user = await User.findOne({ employeeId, isActive: true })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate and store OTP (temporary - will be removed later)
    const otp = String(Math.floor(100000 + Math.random() * 900000)) // 6-digit OTP
    const userIdStr = user._id.toString()
    
    otpStore[userIdStr] = {
      otp: otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token directly (OTP removed for now)
    const token = generateToken(user)

    console.log(`[LOGIN] User logged in: ${employeeId}`)

    res.json({
      success: true,
      token,
      role: user.role,
      userId: userIdStr,
      message: 'Login successful',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' })
    }

    // Normalize userId to string
    const userIdKey = String(userId).trim()
    const otpStr = String(otp).trim()
    const storedOTP = otpStore[userIdKey]

    console.log(`[VERIFY] UserID: ${userIdKey}, OTP Received: ${otpStr}, OTP Stored: ${storedOTP?.otp}`)

    if (!storedOTP) {
      console.log(`[VERIFY] OTP not found for ID: ${userIdKey}`)
      return res.status(401).json({ message: 'OTP not found. Please login again.' })
    }

    if (storedOTP.otp !== otpStr) {
      console.log(`[VERIFY] OTP mismatch: received '${otpStr}' but stored '${storedOTP.otp}'`)
      return res.status(401).json({ message: 'Invalid OTP' })
    }

    if (Date.now() > storedOTP.expiry) {
      return res.status(401).json({ message: 'OTP expired. Please login again.' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken(user)

    // Clean up OTP
    delete otpStore[userIdKey]

    res.json({
      success: true,
      token,
      role: user.role,
      userId: user._id,
      message: 'Login successful',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'OTP verification failed', error: error.message })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const token = generateToken(user)

    res.json({
      success: true,
      token,
    })
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' })
  }
}
