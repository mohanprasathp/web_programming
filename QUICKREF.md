# Quick Reference Card

## ⚡ Essential Commands

### Installation & Setup
```bash
npm install                              # Install root deps
cd frontend && npm install && cd ..      # Frontend deps
cd backend && npm install && cd ..       # Backend deps
npm run dev                              # Start both (with concurrently)
```

### Backend Commands
```bash
cd backend
npm run dev                              # Start with nodemon (hot reload)
npm run seed                             # Create test data
npm start                                # Production start (no nodemon)
npm audit                                # Check vulnerabilities
npm audit fix                            # Fix vulnerabilities
```

### Frontend Commands
```bash
cd frontend
npm run dev                              # Start Vite dev server
npm run build                            # Build for production
npm run preview                          # Preview production build
npm run lint                             # Run ESLint (optional)
```

### Database Commands
```bash
mongo                                    # Open MongoDB shell
# In MongoDB shell:
show databases                           # List all databases
use eduscope                             # Switch to eduscope db
show collections                         # List all collections
db.users.find()                         # Find all users
db.users.findOne()                      # Find first user
db.users.count()                        # Count users
db.users.deleteMany({})                 # Delete all (WARNING!)
db.dropDatabase()                       # Delete database (WARNING!)
```

### Useful System Commands
```bash
# Check port usage
netstat -ano | findstr :5000            # Windows
lsof -i :5000                           # macOS/Linux

# Kill process using port
taskkill /PID <number> /F               # Windows
kill -9 <PID>                           # macOS/Linux

# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest
```

---

## 🔐 Authentication

### Login Flow
```
Frontend → POST /api/auth/login → Backend
Frontend ← OTP in console (dev) ← Backend
Frontend → POST /api/auth/verify-otp → Backend
Frontend ← JWT Token ← Backend
```

### Store Token in Frontend
```javascript
// After successful OTP verification
localStorage.setItem('token', response.data.token)
localStorage.setItem('userId', response.data.userId)
localStorage.setItem('role', response.data.role)
```

### Use Token in Requests
```javascript
const token = localStorage.getItem('token')
axios.get('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Logout
```javascript
localStorage.removeItem('token')
localStorage.removeItem('userId')
localStorage.removeItem('role')
navigate('/login')
```

---

## 🗺️ GPS Features

### Get Current Location
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords
    console.log(`Lat: ${latitude}, Lon: ${longitude}, Acc: ${accuracy}m`)
  },
  (error) => console.error(error),
  { enableHighAccuracy: true }
)
```

### Calculate Distance (Haversine Formula)
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(a))
  return R * c // distance in meters
}

// Usage
const distance = calculateDistance(12.9716, 77.5946, 13.0827, 80.2707)
console.log(`Distance: ${distance.toFixed(2)} meters`)
```

### GPS Verification (100m Check)
```javascript
// Frontend
if (distance > 100) {
  alert(`Too far (${distance.toFixed(0)}m). Must be within 100m.`)
  return
}

// Backend (deoController)
const dist = calculateDistance(lat, lon, school.latitude, school.longitude)
if (dist > 100) {
  return res.status(400).json({
    message: `Distance: ${dist.toFixed(0)}m. Max allowed: 100m.`
  })
}
```

---

## 📱 API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/login                  # Login with employeeId & password
POST   /api/auth/verify-otp             # Verify OTP and get JWT
POST   /api/auth/refresh-token          # Refresh expired JWT
POST   /api/auth/logout                 # Logout (client-side)
```

### CEO Routes
```
GET    /api/ceo/dashboard               # CEO dashboard stats
POST   /api/ceo/inspection-plans        # Create new plan
GET    /api/ceo/inspection-plans        # Get all plans
PUT    /api/ceo/inspection-plans/:id    # Update plan
POST   /api/ceo/assign-schools/:id      # Assign schools to DEO
POST   /api/ceo/sign-plan/:id           # Digitally sign plan (with OTP)
GET    /api/ceo/reports                 # Get all inspection reports
GET    /api/ceo/issues                  # Get all issues
```

### DEO Routes
```
GET    /api/deo/dashboard               # DEO dashboard
GET    /api/deo/inspections             # Get assigned inspections
POST   /api/deo/inspections/:id/start   # Start inspection (GPS check)
PUT    /api/deo/inspections/:id/checklist  # Submit checklist
POST   /api/deo/inspections/:id/photo   # Upload geo-tagged photo
POST   /api/deo/issues                  # Create issue
POST   /api/deo/inspections/:id/submit  # Submit report (GPS & OTP)
```

### Headmaster Routes
```
GET    /api/headmaster/dashboard        # Headmaster dashboard
GET    /api/headmaster/reports          # Get inspection reports
GET    /api/headmaster/issues           # Get issues for school
POST   /api/headmaster/issues/:id/action  # Add corrective action
POST   /api/headmaster/issues/:id/extension  # Request deadline extension
PUT    /api/headmaster/issues/:id/resolve   # Mark issue resolved
```

### Test Data (After Seeding)
```
Employee IDs: ceo001, deo001, hm001
Password: password123
OTP: 123456
Schools: Perambur School, Chennai School, Adyar School
```

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"ceo001","password":"password123"}'
```

### Verify OTP (Insert token from login response)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"ceo001","otp":"123456"}'
```

### Get Dashboard (Insert token from OTP response)
```bash
curl -X GET http://localhost:5000/api/ceo/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Inspections (DEO endpoint)
```bash
curl -X GET http://localhost:5000/api/deo/inspections \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 React Component Template

```javascript
import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const MyPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/endpoint', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/endpoint/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData() // Refresh
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Page Title</h1>
        {/* Content */}
      </div>
    </>
  )
}

export default MyPage
```

---

## 📝 Express Controller Template

```javascript
const Model = require('../models/Model')

// Get all
exports.getAll = async (req, res) => {
  try {
    const items = await Model.find()
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get one
exports.getById = async (req, res) => {
  try {
    const item = await Model.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create
exports.create = async (req, res) => {
  try {
    const item = new Model(req.body)
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update
exports.update = async (req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete
exports.delete = async (req, res) => {
  try {
    await Model.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

---

## 🎯 Tailwind CSS Cheat Sheet

### Common Utilities
```javascript
// Padding & Margin
p-4, px-6, py-3, pl-2, pr-5
m-4, mx-auto, my-6, mb-8

// Sizing
w-full, w-1/2, h-32, max-w-md
min-h-screen

// Colors
bg-blue-50, bg-white, bg-gray-100
text-gray-600, text-blue-600, text-red-500
border-gray-200, border-blue-300

// Text
text-xl, text-2xl, font-bold, font-semibold
uppercase, lowercase, capitalize

// Flexbox
flex, flex-col, items-center, justify-between
gap-4

// Grid
grid, grid-cols-3, gap-6

// Display
hidden, block, inline-block
flex, grid

// Responsive
md:, lg:, xl:, 2xl:
md:grid-cols-2, lg:text-lg

// Borders & Shadows
border, rounded-lg, shadow-md
border-l-4, border-t-2

// Transform
hover:bg-gray-50, focus:outline-none
transition, duration-200

// Opacity
opacity-50, hover:opacity-75
```

---

## 🔄 Git Workflow

```bash
# Clone/setup
git clone <repo>
git checkout -b feature/name

# Make changes
git status                              # See what changed
git add .                              # Stage all changes
git commit -m "feat: description"      # Commit

# Push
git push origin feature/name            # Push to remote
# Create Pull Request on GitHub

# Merge (after PR approval)
git checkout main
git merge feature/name
git push origin main
```

---

## 📚 Environment Variables Template

**backend/.env**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduscope
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
OTP_EXPIRE=5m
FRONTEND_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=+1234567890
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EduScope
```

---

## 🆘 Emergency Shortcuts

**Application won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run seed
npm run dev
```

**MongoDB connection failing?**
```bash
# Restart MongoDB
mongod  # or on Windows: net start MongoDB

# Or use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

**Port already in use?**
```bash
# Kill process on port
fuser -k 5000/tcp  # macOS/Linux
netstat -ano | findstr :5000 | findstr LISTENING  # Windows
```

**Tests failing?**
```bash
npm run seed                # Re-create test data
npm audit fix               # Fix dependencies
npm cache clean --force     # Clear cache
npm install                 # Fresh install
```

---

## 📞 Quick Help Links

| Topic | Location |
|-------|----------|
| **Setup** | [QUICKSTART.md](QUICKSTART.md) or [SETUP.md](SETUP.md) |
| **API Docs** | [backend/API.md](backend/API.md) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Dev Guide** | [DEVELOPMENT.md](DEVELOPMENT.md) |
| **Troubleshooting** | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| **This Card** | [QUICKREF.md](QUICKREF.md) |

---

**Last Updated**: 2024
**Version**: 1.0
