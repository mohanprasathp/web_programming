# Architecture & Design

## System Overview

The School Inspection Monitoring System is a 3-tier web application designed for the Tamil Nadu Education Department to digitize and streamline school inspections across the state.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React.js + Vite)               │
│         Browser-based UI for three different roles           │
├─────────────────────────────────────────────────────────────┤
│               HTTPS/REST API Communication                   │
├─────────────────────────────────────────────────────────────┤
│              Backend (Node.js + Express)                      │
│            RESTful API with business logic                    │
├─────────────────────────────────────────────────────────────┤
│             Database (MongoDB)                               │
│          Collections: Users, Schools, Inspections,            │
│          Reports, Issues, Notifications, Plans               │
└─────────────────────────────────────────────────────────────┘
```

## Key Technologies

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite (fast development)
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI
- **Charts**: Recharts
- **Maps**: Leaflet.js
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: multer
- **Validation**: Joi (optional)
- **CORS**: cors
- **Environment**: dotenv

### Database
- **MongoDB** (NoSQL)
- **Collections**: 7 main collections
- **Geospatial**: Coordinates for GPS verification

## Data Models

### User
- Stores employee information
- Supports 3 roles: CEO, DEO/BEO, HEADMASTER
- Password hashing with bcrypt
- OTP support for 2FA

### School
- Contains school details (UDISE code, location, facilities)
- GPS coordinates for location verification
- Student and teacher counts

### InspectionPlan
- Created by CEO
- Contains checklist items for inspection
- Assigns schools to inspectors with deadlines
- Digital signature support

### Inspection
- Individual school inspection record
- Tracks GPS start location and timestamp
- Stores checklist responses
- Contains uploaded photos with geo-tags
- Links to created issues

### Report
- Generated from completed inspections
- Overall findings and recommendations
- Rating and review status
- Digital signature support

### Issue
- Problem/deficiency identified during inspection
- Prioritized (LOW, MEDIUM, HIGH, CRITICAL)
- Tracks corrective actions
- Deadline tracking with extension support

### Notification
- Event-based updates
- Types: assignment, submission, deadline alerts
- Read/unread tracking

## Authentication Flow

```
User Login
    ↓
Validate Credentials
    ↓
Generate OTP (6 digits)
    ↓
User Enters OTP
    ↓
Verify OTP
    ↓
Generate JWT Token
    ↓
Store Token in localStorage
    ↓
Redirect to Role Dashboard
```

## Inspection Workflow

```
CEO Creates Plan
    ↓
CEO Signs Plan (OTP verification)
    ↓
CEO Assigns Schools to Officers
    ↓
Officer Views Assignment
    ↓
Officer Clicks "Start Inspection"
    ↓  
GPS Location Verification (within 100m)
    ↓
Location & Time Recorded in DB
    ↓
Status → IN_PROGRESS
    ↓
Officer Fills Checklist Form
    ↓
Officer Uploads Geo-tagged Photos
    ↓
Officer Creates Issues (if any)
    ↓
Officer Submits Report (OTP signature)
    ↓
Status → COMPLETED
    ↓
Headmaster Receives Report
    ↓
Headmaster Resolves Issues
```

## GPS Security Features

1. **Location Verification**: Must be within 100 meters of school
2. **Timestamp Recording**: Capture exact start time
3. **Accuracy Tracking**: Record GPS accuracy
4. **Photo Geo-tagging**: All photos include GPS coordinates
5. **Database Storage**: All locations recorded for audit trail

## Role-Based Access Control

### CEO
- Create inspection plans
- View all schools and inspections
- Assign schools to officers
- Digitally sign plans
- View analytics and reports
- Monitor issues
- Can view all reports

### DEO/BEO (Inspector)
- View assigned schools/inspections
- Start inspections with GPS verification
- Fill detailed checklists
- Upload photos with geo-tagging
- Create issue reports
- Submit complete reports with signature
- Access denied to planning and approval

### HEADMASTER
- View inspection reports for their school
- View assigned issues
- Submit corrective actions
- Request deadline extensions
- Upload proof of resolution
- Cannot create or modify inspections

## API Request Flow

```javascript
Frontend
  ↓
axios with Bearer token
  ↓
Backend Express Server
  ↓
Authentication Middleware (verify JWT)
  ↓
Role Check Middleware
  ↓
Route Handler/Controller
  ↓
Business Logic
  ↓
MongoDB Query
  ↓
Response to Frontend
```

## Security Considerations

1. **JWT Tokens**: Signed and time-limited (7 days default)
2. **Password Hashing**: bcryptjs with salt rounds
3. **OTP Validation**: Time-limited (5 minutes default)
4. **CORS**: Configured for frontend origin only
5. **Role-based Access**: Strict role validation on every protected route
6. **Input Validation**: Joi for request validation
7. **Error Handling**: Sanitized error messages in production

## Performance Features

1. **Vite**: Lightning-fast build tool for frontend
2. **MongoDB Indexing**: Indexed frequently queried fields
3. **JWT**: Lightweight authentication without session storage
4. **Lazy Loading**: React lazy loading for routes
5. **Pagination**: Implementations ready for large datasets
6. **Caching**: Browser cache for static assets

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API design
2. **Database Replication**: MongoDB replica sets support
3. **CDN**: Static assets can be served via CDN
4. **Load Balancing**: Express apps can run behind load balancer
5. **Microservices**: Currently modular for extraction later
6. **API Versioning**: Ready for `/api/v2` routes

## Error Handling

### Frontend
- User-friendly error messages
- Session timeout handling
- Network error recovery
- Form validation feedback

### Backend
- Centralized error handling middleware
- Detailed logging for debugging
- Proper HTTP status codes
- Sanitized error responses

## Testing Considerations

### Unit Testing
- Individual controller functions
- Utility function tests
- Component tests (React)

### Integration Testing
- End-to-end workflows
- API endpoint testing
- Database operations

### E2E Testing
- Full user workflows
- Role-based scenarios
- GPS verification flow

## Deployment

### Frontend
- Build: `npm run build`
- Output: `frontend/dist/`
- Can be deployed to: Netlify, Vercel, AWS S3, Azure

### Backend
- No build step needed
- Deploy entire `backend/` folder
- Can be deployed to: Heroku, AWS EC2, Railway, Azure

### Database
- MongoDB Atlas (Cloud) recommended
- Or self-hosted MongoDB server

## Monitoring & Analytics

### Recommended Tools
- **APM**: New Relic, Datadog
- **Logging**: ELK Stack, Splunk
- **Analytics**: Google Analytics (frontend)
- **Uptime**: Uptime Robot, StatusPage

## Future Enhancements

1. **Real-time Updates**: Socket.io for notifications
2. **Offline Mode**: Service Worker + IndexedDB
3. **PDF Reports**: Client-side PDF generation
4. **SMS/Email**: Twilio SMS, NodeMailer integration
5. **Mobile App**: React Native version
6. **Dashboard Analytics**: Advanced charting
7. **Field Sync**: Offline data sync capability
8. **Multi-language**: i18n support for Tamil/English

## Maintenance

### Regular Tasks
- Monitor logs for errors
- Update dependencies monthly
- Backup database regularly
- Review user access
- Archive old inspection data

### Security Updates
- Keep Node.js updated
- Update npm packages: `npm audit fix`
- Review JWT expiration policy
- Monitor failed login attempts

## Documentation Standards

All code includes:
- JSDoc comments for functions
- Inline comments for complex logic
- README files in each folder
- API documentation
- Setup instructions
