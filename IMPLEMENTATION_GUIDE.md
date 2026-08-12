# Implementation Guide - School Inspection System

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inspection-system
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 2. Start Backend
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Start Vite dev server
```

### 4. Seed Database
```bash
cd backend
npm run seed  # Populates test data
```

---

## API Reference

### Authentication
```
POST /api/auth/login
{
  "employeeId": "string",
  "password": "string"
}

POST /api/auth/verify-otp
{
  "userId": "string",
  "otp": "string"
}
```

### Inspection Workflow (DEO/BEO)

#### 1. Get Assigned Inspections
```
GET /api/deo/inspections
Response: Array of inspection objects with schoolId populated
```

#### 2. Start Inspection
```
POST /api/deo/start-inspection
{
  "inspectionId": "string",
  "latitude": number (-90 to 90),
  "longitude": number (-180 to 180),
  "accuracy": number (optional)
}

Response on success:
{
  "success": true,
  "message": "Inspection started successfully",
  "inspection": {...}
}

Response on failure:
{
  "success": false,
  "message": "You are 150.45m away from the school. You must be within 100m to start inspection.",
  "distance": 150,
  "required": 100
}
```

#### 3. Submit Checklist
```
POST /api/deo/submit-checklist
{
  "inspectionId": "string",
  "checklist": {
    "infrastructure": "string (min 5 chars)",
    "academic": "string (min 5 chars)",
    "governmentSchemes": "string (min 5 chars)",
    "safety": "string (min 5 chars)"
  },
  "remarks": "string (optional, max 1000 chars)"
}
```

#### 4. Create Issue
```
POST /api/deo/create-issue
{
  "inspectionId": "string",
  "schoolId": "string (optional)",
  "issueType": "INFRASTRUCTURE|ACADEMIC|SAFETY|GOVERNMENT_SCHEME|OTHER",
  "title": "string (3-200 chars)",
  "description": "string (10-2000 chars)",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL"
}
```

#### 5. Upload Photo
```
POST /api/deo/upload-photo
Content-Type: multipart/form-data
{
  "photo": File,
  "inspectionId": "string",
  "latitude": number,
  "longitude": number
}
```

#### 6. Request OTP
```
POST /api/deo/request-report-otp
{
  "inspectionId": "string"
}

Response:
{
  "success": true,
  "message": "OTP generated successfully...",
  "otp": "123456" // Only in development
}
```

#### 7. Submit Report
```
POST /api/deo/submit-report
{
  "inspectionId": "string",
  "endLatitude": number,
  "endLongitude": number,
  "otp": "string (6 digits)"
}

Response:
{
  "success": true,
  "message": "Report submitted successfully with digital signature verification",
  "inspection": {...}
}
```

---

## Frontend Components Structure

```
frontend/src/
├── pages/
│   ├── deo/
│   │   ├── StartInspection.jsx        ← GPS capture & validation
│   │   ├── InspectionForm.jsx         ← Checklist form
│   │   ├── CreateIssue.jsx            ← Issue creation (optional)
│   │   ├── PhotoUpload.jsx            ← Photo upload (optional)
│   │   └── SubmitReport.jsx           ← OTP & submission
│   ├── ceo/
│   │   ├── CEODashboard.jsx           ← Main dashboard
│   │   ├── CreatePlan.jsx             ← Create inspection plans
│   │   └── AssignSchools.jsx          ← Assign schools to officers
│   └── headmaster/
│       ├── HeadmasterDashboard.jsx    ← Dashboard
│       ├── HeadmasterIssues.jsx       ← View and resolve issues
│       └── CorrectiveActions.jsx      ← Track corrective actions
├── services/
│   └── api.js                         ← Axios instance & service methods
└── utils/
    └── geolocation.js                 ← GPS utilities
```

---

## Validation Rules

### GPS Coordinates
- Latitude: -90 to 90
- Longitude: -180 to 180
- Distance: Must be within 100m of school

### Checklist Fields
- Each section: minimum 5 characters
- All 4 sections required: Infrastructure, Academic, Government Schemes, Safety

### Issues
- Title: 3-200 characters
- Description: 10-2000 characters
- Priority: LOW, MEDIUM, HIGH, CRITICAL (required)
- Type: INFRASTRUCTURE, ACADEMIC, SAFETY, GOVERNMENT_SCHEME, OTHER (required)

### OTP
- Length: exactly 6 digits
- TTL: 5 minutes
- One-time use only

---

## Error Handling

### Common Error Responses

**Validation Error (400)**
```json
{
  "message": "Validation error",
  "details": [
    "OTP must be exactly 6 digits",
    "inspectionId is required"
  ]
}
```

**Authorization Error (401/403)**
```json
{
  "message": "No token provided" // 401
  // or
  "message": "You are not assigned to this inspection" // 403
}
```

**Not Found (404)**
```json
{
  "message": "Inspection not found"
}
```

**Business Logic Error (400)**
```json
{
  "message": "You are 150.45m away from the school. You must be within 100m to start inspection.",
  "distance": 150,
  "required": 100
}
```

---

## Development Tips

### Enable Debug Logging
Add to `.env`:
```
DEBUG=inspection:*
LOG_LEVEL=debug
```

### Test OTP Flow
1. OTP is logged to console in development mode
2. Check browser console or terminal for OTP value
3. OTP expires in 5 minutes
4. Each inspection needs a new OTP request

### Test GPS Validation
1. Use browser DevTools to mock coordinates
2. Or use a tool like `curl` with test coordinates:
```bash
curl -X POST http://localhost:5000/api/deo/start-inspection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "inspectionId": "...",
    "latitude": 11.0123,
    "longitude": 76.5678,
    "accuracy": 10
  }'
```

### Common Issues

**Q: Photos not uploading?**
- A: Ensure `/uploads` directory exists and is writable
- Check that multer is properly configured in deoRoutes.js
- Verify FormData is being created correctly

**Q: OTP not working?**
- A: Check that NODE_ENV is development to see OTP in response
- Verify 5-minute TTL hasn't expired
- Each OTP can only be used once

**Q: GPS validation failing?**
- A: Ensure school coordinates are set in database
- Verify coordinates are within valid ranges
- Check that user is physically near school

---

## Database Seeding

The `seed.js` file creates test data:
- **CEO User**: employeeId: "ceo001", password: "password123"
- **DEO/BEO User**: employeeId: "deo001", password: "password123"
- **Headmaster User**: employeeId: "hm001", password: "password123"
- **5 Test Schools** with GPS coordinates
- **1 Inspection Plan** already created
- **Assignments** to DEO users

---

## Deployment

### Environment Variables Checklist

**Backend (.env)**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<production_db_connection>
JWT_SECRET=<secure_random_string>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env.production)**
```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=School Inspection System
```

### File Upload Setup
- Create `/uploads` directory with proper permissions
- Configure CDN for serving photos
- Set up virus scanning for uploads
- Implement access controls for photo downloads

---

## Performance Optimization

1. **Image Optimization**: Compress photos before upload
2. **Database Indexing**: Create indexes on:
   - `inspectionId`
   - `userId`
   - `schoolId`
   - `inspectorId`
3. **Caching**: Implement Redis for OTP store in production
4. **Pagination**: Add pagination to list endpoints

---

## Security Checklist

- [x] Input validation (Joi schemas)
- [x] Role-based access control
- [x] OTP verification for sensitive operations
- [x] HTTPS in production
- [x] CORS configuration
- [x] Rate limiting (recommended to add)
- [x] Password hashing (bcryptjs)
- [x] JWT token validation
- [x] GPS validation for location spoofing prevention
- [ ] File upload virus scanning (recommended)
- [ ] Request logging/monitoring (recommended)

---

## Troubleshooting

### Backend Won't Start
```bash
# Clear modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
# Ensure MongoDB is running on port 27017
```

### Frontend Components Not Rendering
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### API Calls Failing
1. Check browser Network tab for exact error
2. Verify token is being sent in Authorization header
3. Ensure backend is running on correct port
4. Check CORS configuration

---

**For detailed information, refer to IMPROVEMENTS.md**
