# Development Guide

## Project Structure

```
eduscope-project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/          # Login, OTP verification
│   │   │   ├── ceo/           # CEO module pages
│   │   │   ├── deo/           # DEO/BEO module pages
│   │   │   └── headmaster/    # Headmaster module pages
│   │   ├── components/        # Reusable React components
│   │   ├── services/          # API services (axios)
│   │   ├── utils/             # Utility functions
│   │   ├── context/           # React context (for future use)
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── package.json
│   └── .env                   # Environment variables
│
├── backend/
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── School.js
│   │   ├── Inspection.js
│   │   ├── InspectionPlan.js
│   │   ├── Report.js
│   │   ├── Issue.js
│   │   └── Notification.js
│   ├── routes/                # Express routes
│   │   ├── authRoutes.js
│   │   ├── ceoRoutes.js
│   │   ├── deoRoutes.js
│   │   ├── headmasterRoutes.js
│   │   ├── schoolRoutes.js
│   │   ├── inspectionRoutes.js
│   │   └── issueRoutes.js
│   ├── controllers/           # Business logic handlers
│   │   ├── authController.js
│   │   ├── ceoController.js
│   │   ├── deoController.js
│   │   └── headmasterController.js
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # JWT verification, role check
│   ├── utils/                 # Helper functions
│   │   └── auth.js            # OTP, token generation
│   ├── config/                # Configuration
│   │   └── database.js        # MongoDB connection
│   ├── uploads/               # Uploaded files directory
│   ├── server.js              # Main server file
│   ├── seed.js                # Database seeding script
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── API.md                 # API documentation
│
├── QUICKSTART.md              # 5-minute setup guide
├── SETUP.md                   # Detailed setup instructions
├── ARCHITECTURE.md            # System architecture
├── DEVELOPMENT.md             # This file
├── README.md                  # Project overview
├── package.json               # Root package (concurrently)
└── .gitignore                 # Git ignore rules
```

## Code Standards

### Component Structure (React)
```javascript
import { useState, useEffect } from 'react'
import axios from 'axios'

const MyComponent = () => {
  const [state, setState] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch data
  }, [])

  const handleAction = async () => {
    // Handle action
  }

  return (
    <div className="card">
      {/* JSX */}
    </div>
  )
}

export default MyComponent
```

### API Service Pattern
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Add request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const serviceMethod = (params) =>
  api.get('/endpoint', { params })
```

### Controller Pattern (Express)
```javascript
const Model = require('../models/Model')

exports.methodName = async (req, res) => {
  try {
    const { param } = req.body

    // Validation
    if (!param) {
      return res.status(400).json({ message: 'Validation error' })
    }

    // Business logic
    const result = await Model.create(param)

    // Response
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}
```

## Frontend Development

### Adding a New Page

1. **Create component** in `src/pages/role/PageName.jsx`
2. **Add route** in `src/App.jsx`
3. **Add navigation link** in Sidebar
4. **Create API service** if needed in `src/services/`

### Example Page:
```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const NewPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Page Title</h1>
        {/* Content */}
      </div>
    </div>
  )
}

export default NewPage
```

### Using Tailwind Classes
- Padding: `p-4`, `px-6`, `py-3`
- Margin: `m-4`, `mb-6`, `mt-2`
- Background: `bg-blue-50`, `bg-white`
- Text: `text-2xl`, `font-bold`, `text-gray-600`
- Grid/Flex: `grid grid-cols-3`, `flex items-center`
- Responsive: `md:`, `lg:`, `sm:` prefixes

## Backend Development

### Adding a New API Endpoint

1. **Create model** if needed in `models/`
2. **Create/update controller** in `controllers/`
3. **Create/update route** in `routes/`
4. **Add to server.js** imports

### Example Endpoint:

**Model** (models/NewModel.js):
```javascript
const mongoose = require('mongoose')

const newModelSchema = new mongoose.Schema(
  {
    field1: String,
    field2: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('NewModel', newModelSchema)
```

**Controller** (controllers/newController.js):
```javascript
const NewModel = require('../models/NewModel')

exports.create = async (req, res) => {
  try {
    const { field1, field2 } = req.body
    
    const item = new NewModel({
      field1,
      field2,
      createdBy: req.user.userId
    })
    
    await item.save()
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

exports.getAll = async (req, res) => {
  try {
    const items = await NewModel.find().populate('createdBy')
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Error' })
  }
}
```

**Route** (routes/newRoutes.js):
```javascript
const express = require('express')
const newController = require('../controllers/newController')
const { auth, roleCheck } = require('../middleware/auth')

const router = express.Router()

router.use(auth)
router.post('/', newController.create)
router.get('/', newController.getAll)

module.exports = router
```

**Register in server.js**:
```javascript
const newRoutes = require('./routes/newRoutes')
app.use('/api/newmodel', newRoutes)
```

## Common Tasks

### Debug GPS Location
```javascript
// In browser console
navigator.geolocation.getCurrentPosition((pos) => {
  console.log('Current position:', {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    accuracy: pos.coords.accuracy
  })
})
```

### Mock GPS Location (DevTools)
1. Open DevTools (F12)
2. Go to Sensors tab
3. Set Location to custom coordinates
4. Test app behavior

### Check MongoDB Queries
```javascript
// In any controller
const result = await Model.find().explain('executionStats')
console.log(result)
```

### Test API Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"ceo001","password":"password123"}'
```

### View All Routes
```javascript
// Add to server.js
console.log(app._router.stack
  .filter(r => r.route)
  .map(r => Object.keys(r.route.methods)[0].toUpperCase() + ' ' + r.route.path))
```

## Testing

### Frontend Testing (Coming Soon)
```bash
# Add to frontend package.json scripts
"test": "vitest"
"test:ui": "vitest --ui"
```

### Backend Testing (Coming Soon)
```bash
# Add to backend package.json scripts
"test": "jest"
"test:coverage": "jest --coverage"
```

## Performance Tips

1. **Frontend**
   - Use lazy loading for routes
   - Memoize components with `React.memo`
   - Use `useCallback` for event handlers
   - Compress images

2. **Backend**
   - Add indexes to frequently queried fields
   - Use pagination for large data
   - Cache responses when possible
   - Profile slow queries

3. **Database**
   - Create compound indexes for complex queries
   - Archive old data
   - Use aggregation pipelines for complex operations

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| State not updating | Check for immutability, use spread operator |
| Async race conditions | Add cleanup in useEffect (() => return cancel) |
| CORS errors | Check Backend CORS config, frontend API_URL |
| MongoDB connection fails | Check MONGO_URI, ensure MongoDB is running |
| Form submission fails | Check JWT token validity, inspect network tab |

## Deployment Checklist

### Before Deploying

- [ ] Run `npm audit` (fix vulnerabilities)
- [ ] Update all dependencies
- [ ] Test on production database
- [ ] Set secure JWT_SECRET
- [ ] Configure production email/SMS
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Create database backups
- [ ] Test error handling
- [ ] Verify all APIs work
- [ ] Test with all roles
- [ ] Performance testing
- [ ] Security audit

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to hosting service
```

### Backend Deployment
```bash
# Deploy entire backend/ folder
# Set environment variables on server
# Run: npm install && npm start
```

## Resources

- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com
- **Axios**: https://axios-http.com

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/feature-name

# Create Pull Request
# After review, merge to main
```

## Questions?

Refer to inline code comments and documentation files for more details.
