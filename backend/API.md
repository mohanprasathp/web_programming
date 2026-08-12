# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login with employee ID and password. Returns user ID for OTP verification.

**Request:**
```json
{
  "employeeId": "ceo001",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to registered phone",
  "userId": "user_id_here"
}
```

### POST /api/auth/verify-otp
Verify OTP and get JWT token.

**Request:**
```json
{
  "userId": "user_id_from_login",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "role": "CEO",
  "userId": "user_id_here",
  "message": "Login successful"
}
```

## CEO Endpoints

All CEO endpoints require: `Authorization: Bearer {token}` header

### GET /api/ceo/dashboard
Get CEO dashboard statistics.

**Response:**
```json
{
  "totalSchools": 150,
  "inspectionsCompleted": 45,
  "pendingInspections": 30,
  "criticalIssues": 5
}
```

### POST /api/ceo/create-plan
Create new inspection plan.

**Request:**
```json
{
  "title": "Q2 2024 Inspection",
  "description": "Quarterly inspection drive",
  "schools": ["school_id_1", "school_id_2"],
  "plannedStartDate": "2024-04-01",
  "plannedEndDate": "2024-06-30",
  "checklist": {
    "infrastructure": ["Building", "Toilets"],
    "academic": ["Curriculum", "Textbooks"],
    "governmentSchemes": ["Mid Day Meal"],
    "safety": ["Fire Safety"]
  }
}
```

### GET /api/ceo/plans
Get all inspection plans created by CEO.

### POST /api/ceo/assign-schools
Assign schools to DEO/BEO officers.

**Request:**
```json
{
  "planId": "plan_id_here",
  "assignments": [
    {
      "userId": "deo_user_id",
      "schools": ["school_id_1", "school_id_2"],
      "deadline": "2024-06-30"
    }
  ]
}
```

### POST /api/ceo/sign-plan
Digitally sign inspection plan with OTP verification.

**Request:**
```json
{
  "planId": "plan_id_here",
  "otpVerified": true
}
```

### GET /api/ceo/reports
Get inspection reports with filters.

**Query Parameters:**
- `district`: Filter by district
- `startDate`: From date (YYYY-MM-DD)
- `endDate`: To date (YYYY-MM-DD)

### GET /api/ceo/issues
Get all issues from all inspections.

## DEO/BEO Endpoints

All DEO endpoints require: `Authorization: Bearer {token}` header and role must be "DEO/BEO"

### GET /api/deo/dashboard
Get DEO dashboard statistics.

**Response:**
```json
{
  "assignedInspections": 3,
  "completedInspections": 1,
  "pendingInspections": 2,
  "issuesCreated": 5
}
```

### GET /api/deo/inspections
Get all assigned inspections.

### POST /api/deo/start-inspection
Start inspection with GPS verification. Must be within 100 meters of school.

**Request:**
```json
{
  "inspectionId": "inspection_id_here",
  "latitude": 13.1436,
  "longitude": 80.127,
  "accuracy": 15.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inspection started",
  "inspection": { ... }
}
```

### POST /api/deo/upload-photo
Upload geo-tagged photo during inspection.

**Request:** (multipart/form-data)
- `photo`: Image file
- `inspectionId`: Inspection ID
- `latitude`: GPS latitude
- `longitude`: GPS longitude

### POST /api/deo/submit-checklist
Submit inspection checklist and remarks.

**Request:**
```json
{
  "inspectionId": "inspection_id_here",
  "checklist": {
    "infrastructure": "Good condition facility",
    "academic": "Academic standards met",
    "governmentSchemes": "Schemes implemented",
    "safety": "Safety measures in place"
  },
  "remarks": "Overall satisfactory inspection"
}
```

### POST /api/deo/create-issue
Create issue report.

**Request:**
```json
{
  "inspectionId": "inspection_id_here",
  "schoolId": "school_id_here",
  "issueType": "INFRASTRUCTURE",
  "title": "Broken classroom windows",
  "description": "Windows in rooms 5-8 are broken",
  "priority": "HIGH"
}
```

### POST /api/deo/submit-report
Submit completed inspection report with digital signature.

**Request:**
```json
{
  "inspectionId": "inspection_id_here",
  "endLatitude": 13.1436,
  "endLongitude": 80.127
}
```

## Headmaster Endpoints

All Headmaster endpoints require: `Authorization: Bearer {token}` header and role must be "HEADMASTER"

### GET /api/headmaster/dashboard
Get headmaster dashboard statistics.

### GET /api/headmaster/reports
Get received inspection reports.

### GET /api/headmaster/issues
Get all pending issues.

### POST /api/headmaster/add-corrective-action
Add corrective action to resolve issue.

**Request:**
```json
{
  "issueId": "issue_id_here",
  "actionDescription": "Replaced broken windows",
  "targetDate": "2024-05-15",
  "proofPhotos": ["photo_url_1", "photo_url_2"],
  "comments": "All windows replaced with safety glass"
}
```

### POST /api/headmaster/request-extension
Request deadline extension for issue resolution.

**Request:**
```json
{
  "issueId": "issue_id_here",
  "newDeadline": "2024-06-30",
  "reason": "Procurement pending, will receive supplies by end of May"
}
```

### POST /api/headmaster/mark-issue-resolved
Mark issue as resolved.

**Request:**
```json
{
  "issueId": "issue_id_here"
}
```

## School Endpoints

### GET /api/schools
Get all schools.

### GET /api/schools/{id}
Get school details by ID.

### POST /api/schools
Create new school (Admin only).

## Inspection Endpoints

### GET /api/inspections
Get all inspections.

### GET /api/inspections/{id}
Get inspection details by ID.

## Issue Endpoints

### GET /api/issues
Get all issues.

### GET /api/issues/{id}
Get issue details by ID.

## Error Responses

All endpoints return error in this format:

```json
{
  "message": "Error description",
  "error": "Technical error details"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (Invalid/missing token)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found
- 500: Server Error

## Test Data

Use these credentials to test the application:

```
CEO:
  Employee ID: ceo001
  Password: password123

DEO/BEO:
  Employee ID: deo001
  Password: password123

Headmaster:
  Employee ID: hm001
  Password: password123

Test OTP: 123456
```
