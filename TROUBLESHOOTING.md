# Troubleshooting Guide

## Common Issues & Solutions

### 🚨 Installation Issues

#### npm install fails with "node-gyp" errors
**Cause**: Missing C++ build tools
**Solution**:
- **Windows**: Install Visual Studio Build Tools
- **macOS**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: Install build-essential: `sudo apt-get install build-essential python3`

#### Port 5000 or 5173 already in use
**Cause**: Another application using the same port
**Solution**:
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# OR change ports in .env
PORT=5001  # backend
VITE_PORT=5174  # frontend
```

#### MongoDB connection refused
**Cause**: MongoDB not running or connection string incorrect
**Solution**:
```bash
# Start MongoDB locally (macOS/Linux)
mongod

# Start MongoDB on Windows
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

# Or use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eduscope

# Verify connection
mongo  # or mongosh
show dbs
```

---

### 🔐 Authentication Issues

#### Can't login - "Invalid credentials" error
**Cause**: Database not seeded or wrong credentials
**Solution**:
```bash
# Seed test data
cd backend
npm run seed

# Verify users exist
mongo
use eduscope
db.users.find()

# Test credentials (after seeding):
# ceo001 / password123 + OTP 123456
# deo001 / password123 + OTP 123456
# hm001 / password123 + OTP 123456
```

#### OTP not working - "Invalid OTP" error
**Cause**: OTP storage or verification issue
**Solution**:
```bash
# OTP is currently mocked, always use: 123456

# In production, set up Twilio:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Or SMS provider in backend/utils/auth.js
```

#### JWT token expired
**Cause**: Token older than 7 days
**Solution**:
```javascript
// Token expires in 7 days
// Implement refresh token endpoint or re-login
// See backend/controllers/authController.js for refreshToken method
```

#### CORS error - "Access to XMLHttpRequest blocked"
**Cause**: Frontend and backend CORS mismatch
**Solution**:
```javascript
// In backend/server.js, update CORS origin:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// In frontend vite.config.js, verify proxy:
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

---

### 🗺️ GPS & Location Issues

#### Browser asking for location permission - nothing happens
**Cause**: Permission denied or geolocation not supported
**Solution**:
```javascript
// Enable in browser settings
// Settings → Privacy → Location → Allow

// On localhost, geolocation works
// On HTTPS only in production (not HTTP)

// For testing, use DevTools to mock location:
// F12 → Sensors → Location → Custom Coordinates
```

#### GPS accuracy low or distance calculation wrong
**Cause**: Device/browser not providing accurate GPS
**Solution**:
```javascript
// Try outdoors or in stable GPS area
// Enable high-accuracy mode in browser
navigator.geolocation.getCurrentPosition(
  success,
  error,
  { enableHighAccuracy: true }
)

// For development/testing:
// Use DevTools to set exact coordinates
// Or run Chrome with --simulate-outdated-browser flag
```

#### "You are X meters away" error even at correct location
**Cause**: GPS radius check failing (100m requirement)
**Solution**:
```javascript
// Check school coordinates in database
mongo
db.schools.find()  // Verify lat/lon

// For testing with unrealistic distance:
// Use DevTools Sensors to set current location
// Or modify seed.js with test school coordinates
```

#### Photos not getting geo-tagged
**Cause**: GPS not available during photo upload
**Solution**:
```javascript
// Ensure geolocation was successful before upload
// Photos use last known GPS coordinates
// If GPS failed, coordinates will be null

// Check in MongoDB:
db.inspections.findOne().photos[0]  // Should have lat, lon
```

---

### 📁 File Upload Issues

#### Photos not uploading - multer errors
**Cause**: Upload directory doesn't exist or permission denied
**Solution**:
```bash
# Create uploads directory
mkdir backend/uploads

# Verify permissions (Linux/macOS)
chmod 755 backend/uploads

# Check multer config in backend/routes/deoRoutes.js
# Ensure destination exists
```

#### File size too large error
**Cause**: Photo exceeds 5MB limit
**Solution**:
```javascript
// In backend/routes/deoRoutes.js, update limit:
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
```

#### Extension not allowed error
**Cause**: Uploading unsupported file type
**Solution**:
```javascript
// Allowed extensions: jpg, jpeg, png, gif, webp
// Only upload image files

// To add more types, update deoRoutes.js:
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
```

---

### 💾 Database Issues

#### MongoDB keeps crashing or disconnecting
**Cause**: Insufficient memory or disk space
**Solution**:
```bash
# Check available space
df -h  # Linux/macOS
dir C:  # Windows

# MongoDB default: 2GB
# Ensure at least 512MB available

# For local development, limit MongoDB:
mongod --journal --dbpath ./data
```

#### Duplicate key error on user creation
**Cause**: Employee ID already exists (unique constraint)
**Solution**:
```bash
# Check existing users
mongo
db.users.find({}, {employeeId: 1})

# Remove duplicates
db.users.deleteOne({employeeId: "ceo001"})

# Or clear and re-seed
db.dropDatabase()
npm run seed
```

#### Inspection status stuck on IN_PROGRESS
**Cause**: API call failed but status changed
**Solution**:
```bash
# Manually update in MongoDB
mongo
db.inspections.updateOne(
  {_id: ObjectId("...")},
  {$set: {status: "PENDING"}}
)
```

#### Cannot find schools when starting inspection
**Cause**: School data not seeded or school not in database
**Solution**:
```bash
# Verify schools exist
mongo
db.schools.find()

# If empty, run seed
npm run seed

# Verify school coordinates (required for GPS check)
db.schools.find({}, {name: 1, latitude: 1, longitude: 1})
```

---

### ⚛️ Frontend Issues

#### Components not rendering - blank page
**Cause**: JavaScript error or missing dependencies
**Solution**:
```bash
# Check browser console (F12)
# Look for red errors

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear browser cache (Ctrl+Shift+Del)
```

#### React Router not working - pages not navigating
**Cause**: Routes not configured correctly
**Solution**:
```javascript
// Check src/App.jsx routes are correct:
<Route path="/deo/start-inspection/:id" element={<StartInspection />} />

// Verify BrowserRouter wraps all routes
<BrowserRouter>
  <Routes>
    {/* routes here */}
  </Routes>
</BrowserRouter>
```

#### Tailwind CSS not applying styles
**Cause**: Vite not processing Tailwind
**Solution**:
```bash
# Rebuild Vite dev server
npm run dev

# Or check tailwind.config.js for correct content paths:
content: ["./src/**/*.{js,jsx}"]

# Verify postcss.config.js exists with tailwindcss plugin
```

#### Charts not displaying (Recharts)
**Cause**: Data not passed correctly to component
**Solution**:
```javascript
// Verify data structure in Analytics component
const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 }
]

<LineChart data={data}>
  <CartesianGrid />
  <XAxis dataKey="name" />
  <Line dataKey="value" />
</LineChart>
```

#### Form not submitting
**Cause**: Validation error or API failure
**Solution**:
```javascript
// Add console logging
handleSubmit = (e) => {
  e.preventDefault()
  console.log('Form data:', formData)
  console.log('Errors:', errors)
  // Check console F12 for details
}

// Test API endpoint directly
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"field":"value"}'
```

---

### 🖥️ Backend Issues

#### Server crashes on startup
**Cause**: Missing environment variables or bad configuration
**Solution**:
```bash
# Check .env file exists in backend/
cat backend/.env

# Verify all required variables:
# MONGO_URI, JWT_SECRET, NODE_ENV, PORT, FRONTEND_URL

# Restart with debug logging
NODE_ENV=development npm run dev
```

#### API endpoint returns 500 error
**Cause**: Server-side code error, database error, or bug
**Solution**:
```bash
# Check terminal for error message
# Look for stack trace

# Test with curl to isolate issue
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{}'

# Check database has required data
mongo
db.inspections.findOne()  # Returns null = data missing
```

#### API returns 401 / 403 - Unauthorized
**Cause**: Missing JWT token or wrong role
**Solution**:
```javascript
// Include JWT token in headers
const token = localStorage.getItem('token')
axios.get('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})

// Verify token is valid (not expired)
// Use jwt.io to decode and check exp field

// Login again to get new token
```

#### Multer upload errors
**Cause**: File too large, wrong path, or missing directory
**Solution**:
```bash
# Create uploads directory
mkdir -p backend/uploads

# Check file size is under 5MB
# Verify MIME type is image/jpeg, image/png, etc.

# Check upload config in deoRoutes.js
app.post('/upload', upload.single('photo'), ...)
```

#### Database query timeout
**Cause**: Complex query or large dataset
**Solution**:
```javascript
// Add indexes for better performance
db.inspections.createIndex({ schoolId: 1 })
db.inspections.createIndex({ status: 1, createdAt: -1 })

// Use pagination in API response
const limit = 20
const page = req.query.page || 1
const skip = (page - 1) * limit
const items = await Inspection.find().skip(skip).limit(limit)
```

---

### 📱 Browser/Environment Issues

#### Using old Node version
**Cause**: Node.js v14 or older
**Solution**:
```bash
# Check Node version
node --version  # Should be v16+

# Update Node
# Download from https://nodejs.org/
# Or use nvm (Node Version Manager)

# macOS/Linux with nvm
nvm install 18
nvm use 18
```

#### Vite dev server very slow
**Cause**: Large number of files or slow disk
**Solution**:
```bash
# Increase Vite watcher limit (if on Linux)
echo fs.inotify.max_user_watches=100000 | sudo tee -a /etc/sysctl.conf

# Clear .vite cache
rm -rf .vite

# Use faster disk (SSD vs HDD)
```

#### Can't access app from mobile device
**Cause**: Different IP address or firewall
**Solution**:
```bash
# Use device's IP instead of localhost
# Find your machine IP:
ipconfig  # Windows
ifconfig  # macOS/Linux

# On mobile, navigate to: http://YOUR_IP:5173
# Make sure firewall allows the port

# Vite config to allow all IPs:
vite.config.js → server: { host: '0.0.0.0' }
```

---

## Getting Help

### Debug Steps
1. **Check browser console** (F12) for JavaScript errors
2. **Check terminal** where npm run dev is running
3. **Check network tab** in DevTools → API responses
4. **Verify .env files** have required variables
5. **Test with curl/Postman** to isolate frontend vs backend
6. **Check MongoDB directly** with mongo shell
7. **Review log files** if in production

### Useful Commands

```bash
# Check ports in use
netstat -an | grep LISTEN  # macOS/Linux
netstat -ano | findstr LISTENING  # Windows

# View running processes
ps aux | grep node  # macOS/Linux
tasklist | findstr node  # Windows

# Clear npm cache
npm cache clean --force

# Check Node modules for issues
npm audit
npm audit fix

# See detailed error logs
NODE_ENV=development npm run dev 2>&1 | tee debug.log

# MongoDB shell commands
mongo
show databases
show collections
db.users.count()
db.users.findOne()
db.users.deleteMany({})  # Warning: deletes all!
```

### When Nothing Works

1. **Backup your data** if using production DB
2. **Remove node_modules** and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Reset database** if safe
   ```bash
   mongo
   db.dropDatabase()
   npm run seed
   ```
4. **Start fresh** 
   ```bash
   git clean -fdx  # Remove all untracked files
   npm install
   npm run seed
   npm run dev
   ```
5. **Check documentation** - SETUP.md, API.md, ARCHITECTURE.md
6. **Review generated logs** for cryptic error messages

---

## Still Stuck?

- Review the **[SETUP.md](SETUP.md)** for comprehensive setup
- Read **[ARCHITECTURE.md](ARCHITECTURE.md)** for system design understanding
- Check **[API.md](backend/API.md)** for API details
- Review **[DEVELOPMENT.md](DEVELOPMENT.md)** for code patterns
- Look at seed data in **backend/seed.js** for examples
- Check browser DevTools and terminal output for specific error messages

Remember: Most issues are with configuration or missing dependencies. Always check:
- ✅ .env files exist and have values
- ✅ MongoDB is running
- ✅ All npm install ran successfully
- ✅ Seed script completed (check for test data)
- ✅ Ports 5000 and 5173 are free
