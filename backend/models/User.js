const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    email: String,
    phone: String,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['CEO', 'DEO/BEO', 'HEADMASTER'],
      required: true,
    },
    district: String,
    block: String,
    school: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    otpHash: String,
    otpExpiry: Date,
    lastLogin: Date,
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
