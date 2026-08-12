const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    udiseCode: {
      type: String,
      required: true,
      unique: true,
    },
    district: String,
    block: String,
    village: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
    principalName: String,
    principalPhone: String,
    totalStudents: Number,
    totalTeachers: Number,
    schoolType: {
      type: String,
      enum: ['PRIMARY', 'MIDDLE', 'HIGH', 'HIGHER_SECONDARY'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('School', schoolSchema)
