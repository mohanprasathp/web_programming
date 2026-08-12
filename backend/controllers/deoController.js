const Inspection = require('../models/Inspection')
const School = require('../models/School')
const Issue = require('../models/Issue')
const { calculateDistance } = require('../utils/auth')
const { issueReportOtp, verifyReportOtp } = require('../services/otpService')
const {
  startInspectionSchema,
  submitChecklistSchema,
  createIssueSchema,
  submitReportSchema,
  requestReportOtpSchema,
} = require('../validators/inspectionValidator')

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId

    const assignedInspections = await Inspection.countDocuments({
      inspectorId: userId,
    })
    const completedInspections = await Inspection.countDocuments({
      inspectorId: userId,
      status: 'COMPLETED',
    })
    const pendingInspections = await Inspection.countDocuments({
      inspectorId: userId,
      status: 'PENDING',
    })
    const issuesCreated = await Issue.countDocuments({
      createdBy: userId,
    })

    res.json({
      assignedInspections,
      completedInspections,
      pendingInspections,
      issuesCreated,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message })
  }
}

exports.getAssignedInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find({
      inspectorId: req.user.userId,
    })
      .populate('schoolId')
      .populate('inspectionPlanId')

    res.json(inspections)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inspections', error: error.message })
  }
}

exports.startInspection = async (req, res) => {
  try {
    // Validate input
    const { error, value } = startInspectionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    const { inspectionId, latitude, longitude, accuracy } = value

    const inspection = await Inspection.findById(inspectionId).populate('schoolId')

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspection.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Check status
    if (inspection.status !== 'PENDING') {
      return res.status(400).json({
        message: `Inspection is already ${inspection.status}. Cannot start an already started inspection.`,
      })
    }

    // Verify school location is configured
    if (!inspection.schoolId?.latitude || !inspection.schoolId?.longitude) {
      return res.status(400).json({
        message: 'School location is not configured. Contact administrator.',
      })
    }

    // GPS validation: must be within 100 meters of school
    const distance = calculateDistance(
      latitude,
      longitude,
      inspection.schoolId.latitude,
      inspection.schoolId.longitude
    )

    if (distance > 100) {
      return res.status(400).json({
        message: `You are ${distance.toFixed(2)}m away from the school. You must be within 100m to start inspection.`,
        distance: Math.round(distance),
        required: 100,
      })
    }

    // Update inspection with start details
    inspection.status = 'IN_PROGRESS'
    inspection.startTime = new Date()
    inspection.startLocation = {
      latitude,
      longitude,
      accuracy: accuracy || 0,
    }

    await inspection.save()

    res.json({
      success: true,
      message: 'Inspection started successfully',
      inspection: {
        _id: inspection._id,
        schoolId: inspection.schoolId,
        status: inspection.status,
        startTime: inspection.startTime,
        startLocation: inspection.startLocation,
      },
    })
  } catch (error) {
    console.error('Error starting inspection:', error)
    res.status(500).json({
      message: 'Error starting inspection',
      error: error.message,
    })
  }
}

exports.uploadPhoto = async (req, res) => {
  try {
    const { inspectionId, latitude, longitude } = req.body

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        message: 'No photo file provided. Please select an image to upload.',
      })
    }

    // Validate parameters
    if (!inspectionId) {
      return res.status(400).json({ message: 'Inspection ID is required' })
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: 'GPS coordinates (latitude, longitude) are required before uploading photos',
      })
    }

    // Validate coordinates
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Invalid latitude value' })
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ message: 'Invalid longitude value' })
    }

    // Find inspection
    const inspection = await Inspection.findById(inspectionId)

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspection.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Verify inspection is in progress
    if (inspection.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Inspection must be in progress before uploading photos. Please start inspection first.',
      })
    }

    // Add photo with geolocation
    inspection.photos.push({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      timestamp: new Date(),
      latitude: lat,
      longitude: lon,
      filesize: req.file.size,
    })

    await inspection.save()

    const photoData = inspection.photos[inspection.photos.length - 1]

    res.json({
      success: true,
      message: `Photo uploaded successfully (${inspection.photos.length} total)`,
      photo: photoData,
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    res.status(500).json({
      message: 'Error uploading photo',
      error: error.message,
    })
  }
}

exports.submitChecklistAndRemarks = async (req, res) => {
  try {
    // Validate input
    const { error, value } = submitChecklistSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    const { inspectionId, checklist, remarks } = value

    const inspectionDoc = await Inspection.findById(inspectionId)

    if (!inspectionDoc) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspectionDoc.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Verify inspection is in progress
    if (inspectionDoc.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Inspection must be started before submitting checklist. Please start inspection first.',
      })
    }

    // Update inspection with checklist and remarks
    const inspection = await Inspection.findByIdAndUpdate(
      inspectionId,
      {
        checklist,
        remarks,
        updatedAt: new Date(),
      },
      { new: true }
    )

    res.json({
      success: true,
      message: 'Checklist and remarks submitted successfully',
      inspection: {
        _id: inspection._id,
        status: inspection.status,
        checklist: inspection.checklist,
        remarks: inspection.remarks,
      },
    })
  } catch (error) {
    console.error('Error submitting checklist:', error)
    res.status(500).json({
      message: 'Error submitting checklist data',
      error: error.message,
    })
  }
}

exports.createIssue = async (req, res) => {
  try {
    // Validate input
    const { error, value } = createIssueSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    const { inspectionId, schoolId, issueType, title, description, priority } = value

    const inspection = await Inspection.findById(inspectionId)

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspection.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Verify inspection is in progress
    if (inspection.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Inspection must be started before creating issues. Please start inspection first.',
      })
    }

    // Use provided schoolId or derive from inspection
    const resolvedSchoolId = schoolId || inspection.schoolId

    if (!resolvedSchoolId) {
      return res.status(400).json({
        message: 'School ID is missing for this inspection. Contact administrator.',
      })
    }

    // Create new issue
    const issue = new Issue({
      inspectionId,
      schoolId: resolvedSchoolId,
      createdBy: req.user.userId,
      issueType,
      title,
      description,
      priority,
      status: 'OPEN',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      createdAt: new Date(),
    })

    await issue.save()

    // Add issue reference to inspection
    await Inspection.findByIdAndUpdate(
      inspectionId,
      {
        $push: { issues: issue._id },
      },
      { new: true }
    )

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue: {
        _id: issue._id,
        inspectionId: issue.inspectionId,
        issueType: issue.issueType,
        title: issue.title,
        priority: issue.priority,
        status: issue.status,
        deadline: issue.deadline,
      },
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    res.status(500).json({
      message: 'Error creating issue',
      error: error.message,
    })
  }
}

exports.requestReportOtp = async (req, res) => {
  try {
    // Validate input
    const { error, value } = requestReportOtpSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    const { inspectionId } = value

    const inspection = await Inspection.findById(inspectionId)

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspection.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Verify inspection is in progress
    if (inspection.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Inspection must be in progress to request OTP for report submission.',
      })
    }

    // Generate and return OTP
    const otp = issueReportOtp(req.user.userId, inspectionId)

    res.json({
      success: true,
      message: 'OTP generated successfully (check console in development, email/SMS in production)',
      // Note: In development, OTP is logged to console. In production, it would be sent via SMS/Email
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    })
  } catch (error) {
    console.error('Error requesting OTP:', error)
    res.status(500).json({
      message: 'Error requesting OTP',
      error: error.message,
    })
  }
}

exports.submitReport = async (req, res) => {
  try {
    // Validate input
    const { error, value } = submitReportSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
    }

    const { inspectionId, endLatitude, endLongitude, otp } = value

    const inspectionDoc = await Inspection.findById(inspectionId)

    if (!inspectionDoc) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspectionDoc.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Verify inspection is in progress
    if (inspectionDoc.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Inspection must be in progress before report submission',
      })
    }

    const c = inspectionDoc.checklist
    const checklistOk =
      c &&
      typeof c === 'object' &&
      ['infrastructure', 'academic', 'governmentSchemes', 'safety'].every(
        (k) => typeof c[k] === 'string' && c[k].trim().length >= 5
      )
    if (!checklistOk) {
      return res.status(400).json({
        message:
          'Checklist must be completed before submitting report. Open the inspection form and save all four sections (each at least 5 characters).',
      })
    }

    // Verify OTP
    const otpCheck = verifyReportOtp(req.user.userId, inspectionId, otp)
    if (!otpCheck.ok) {
      return res.status(400).json({
        message: `OTP verification failed: ${otpCheck.message}`,
      })
    }

    // Update inspection: mark as completed
    const inspection = await Inspection.findByIdAndUpdate(
      inspectionId,
      {
        status: 'COMPLETED',
        endTime: new Date(),
        endLocation: {
          latitude: endLatitude,
          longitude: endLongitude,
        },
        submittedAt: new Date(),
        signatureVerified: true,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('schoolId')

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    res.json({
      success: true,
      message: 'Report submitted successfully with digital signature verification',
      inspection: {
        _id: inspection._id,
        status: inspection.status,
        schoolId: inspection.schoolId,
        submittedAt: inspection.submittedAt,
        endTime: inspection.endTime,
        signatureVerified: inspection.signatureVerified,
      },
    })
  } catch (error) {
    console.error('Error submitting report:', error)
    res.status(500).json({
      message: 'Error submitting report',
      error: error.message,
    })
  }
}

exports.updateLocation = async (req, res) => {
  try {
    const { inspectionId, latitude, longitude, accuracy } = req.body

    // Validate input
    if (!inspectionId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: 'Inspection ID, latitude, and longitude are required',
      })
    }

    const inspection = await Inspection.findById(inspectionId)

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Verify ownership
    if (String(inspection.inspectorId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this inspection' })
    }

    // Only update location if inspection is in progress
    if (inspection.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Can only update location for in-progress inspections',
      })
    }

    // Update current location
    await Inspection.findByIdAndUpdate(
      inspectionId,
      {
        currentLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: parseFloat(accuracy) || null,
          timestamp: new Date(),
        },
      },
      { new: true }
    )

    res.json({
      success: true,
      message: 'Location updated successfully',
    })
  } catch (error) {
    console.error('Error updating location:', error)
    res.status(500).json({
      message: 'Error updating location',
      error: error.message,
    })
  }
}
