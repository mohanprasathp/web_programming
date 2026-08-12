const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      employeeId: user.employeeId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

const verifyOTP = (otp, hash) => {
  return hashOTP(otp) === hash
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000 // Return distance in meters
}

module.exports = {
  generateOTP,
  generateToken,
  hashOTP,
  verifyOTP,
  calculateDistance,
}
