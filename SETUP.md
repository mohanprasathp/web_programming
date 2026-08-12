# Setup and Installation Guide

## Prerequisites

- **Node.js** v16 or higher (Download from https://nodejs.org/)
- **MongoDB** v4.4 or higher (Download from https://www.mongodb.com/try/download/community)
- **Git** (for version control)

## Quick Start

### 1. Install Dependencies

From the project root directory:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB locally
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` in backend folder

### 3. Configure Environment Variables

**Backend** - Create/Update `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/eduscope
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d
OTP_EXPIRE=5m
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Test Data

```bash
cd backend
npm run seed
```

This creates:
- **3 test users** (CEO, DEO, Headmaster)
- **3 test schools** with realistic data
- **1 inspection plan** with assignments
- **3 pending inspections**

### 5. Start the Application

**Option A: Run Both Together**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Application opens on http://localhost:5173
```

## Test Credentials

After seeding, use these credentials to login:

| Role | Employee ID | Password |
|------|------------|----------|
| Chief Educational Officer (CEO) | ceo001 | password123 |
| District Education Officer (DEO/BEO) | deo001 | password123 |
| Headmaster | hm001 | password123 |

**OTP for all:** `123456`

## Key Features to Test

### 1. **CEO Module**
- ✅ Dashboard with analytics
- ✅ Create inspection plans
- ✅ Digitally sign plans
- ✅ Assign schools to officers
- ✅ View reports and issues

### 2. **DEO/BEO Module** (Most Important)
- ✅ Dashboard with assignment summary
- ✅ View assigned schools
- ✅ **Start Inspection** with GPS verification
  - Must be within 100 meters of school
  - Captures GPS coordinates and timestamp
  - Records in database
- ✅ Fill inspection checklist
- ✅ Upload geo-tagged photos
- ✅ Create issue reports
- ✅ Submit report with digital signature (OTP)

### 3. **Headmaster Module**
- ✅ Dashboard with issue tracking
- ✅ View received inspection reports
- ✅ View pending issues with priorities
- ✅ Add corrective actions
- ✅ Request deadline extensions
- ✅ Mark issues as resolved

## Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
cd backend
npm install
```

### Issue: MongoDB connection error
**Solution:**
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, whitelist your IP

### Issue: Port 5000 or 5173 already in use
**Solution:**
```bash
# Change port in backend/.env or frontend/vite.config.js
# Or kill existing process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### Issue: "GeolocationCoordinatesError"
**Solution:**
- Application requires HTTPS or localhost for GPS
- Allow location permission in browser
- Use a compatible browser (Chrome, Firefox, Edge)

## Project Structure

```
eduscope-project/
├── frontend/                 # React.js + Vite application
│   ├── src/
│   │   ├── pages/           # Role-based pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Node.js + Express API
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & validation
│   ├── utils/               # Helper functions
│   ├── config/              # Configuration
│   ├── server.js            # Main server file
│   ├── seed.js              # Database seeding
│   └── package.json
│
├── package.json             # Root package
└── README.md               # Documentation
```

## Database Collections

### Users
```javascript
{
  employeeId: String,
  name: String,
  password: String (hashed),
  role: "CEO" | "DEO/BEO" | "HEADMASTER",
  district: String,
  block: String,
  school: String,
  lastLogin: Date
}
```

### Schools
```javascript
{
  name: String,
  udiseCode: String (unique),
  district: String,
  latitude: Number,
  longitude: Number,
  totalStudents: Number,
  totalTeachers: Number
}
```

### Inspections
```javascript
{
  schoolId: ObjectId,
  inspectorId: ObjectId,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  startTime: Date,
  startLocation: { latitude, longitude, accuracy },
  checklist: { infrastructure, academic, governmentSchemes, safety },
  photos: [{ url, timestamp, latitude, longitude }],
  issues: [ObjectId],
  submittedAt: Date
}
```

### Issues
```javascript
{
  schoolId: ObjectId,
  createdBy: ObjectId,
  issueType: String,
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  deadline: Date,
  correctiveActions: [],
  extensions: []
}
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/` directory.

### Backend
No build needed - deploy `backend/` folder as-is.

## API Documentation

See [backend/API.md](backend/API.md) for complete API reference.

## Support & Troubleshooting

1. **Check logs** - Terminal output shows detailed error messages
2. **Check network** - Ensure backend is running on port 5000
3. **Clear cache** - Hard refresh browser (Ctrl+Shift+R)
4. **Check MongoDB** - Verify database is running
5. **Check permissions** - GPS/Location permissions in browser

## Next Steps

1. ✅ Install and run locally
2. ✅ Test all three roles
3. ✅ Try GPS-based inspection start
4. ✅ Create and track issues
5. ✅ Upload photos with geo-tagging
6. 📋 Customize for your needs
7. 🚀 Deploy to production

## Contact & Support

For issues or questions, check the API documentation or review the source code comments.

Happy Inspecting! 🎓
