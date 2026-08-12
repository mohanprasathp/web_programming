require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
const authRoutes = require('./routes/authRoutes')
const ceoRoutes = require('./routes/ceoRoutes')
const deoRoutes = require('./routes/deoRoutes')
const headmasterRoutes = require('./routes/headmasterRoutes')
const schoolRoutes = require('./routes/schoolRoutes')
const inspectionRoutes = require('./routes/inspectionRoutes')
const issueRoutes = require('./routes/issueRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const auditLogRoutes = require('./routes/auditLogRoutes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'))

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/ceo', ceoRoutes)
app.use('/api/deo', deoRoutes)
app.use('/api/headmaster', headmasterRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/inspection', inspectionRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/issue', issueRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/audit-logs', auditLogRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal Server Error', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
