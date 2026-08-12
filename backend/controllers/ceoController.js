const School = require('../models/School')
const InspectionPlan = require('../models/InspectionPlan')
const Inspection = require('../models/Inspection')
const Issue = require('../models/Issue')
const User = require('../models/User')

exports.getDashboard = async (req, res) => {
  try {
    const totalSchools = await School.countDocuments()
    const inspectionsCompleted = await Inspection.countDocuments({ status: 'COMPLETED' })
    const pendingInspections = await Inspection.countDocuments({ status: 'PENDING' })
    const criticalIssues = await Issue.countDocuments({ priority: 'CRITICAL', status: { $ne: 'CLOSED' } })

    res.json({
      totalSchools,
      inspectionsCompleted,
      pendingInspections,
      criticalIssues,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message })
  }
}

exports.createInspectionPlan = async (req, res) => {
  try {
    const { title, description, schools, checklist, plannedStartDate, plannedEndDate } = req.body

    if (!title || !plannedStartDate || !plannedEndDate) {
      return res.status(400).json({ message: 'title, plannedStartDate and plannedEndDate are required' })
    }
    if (!Array.isArray(schools) || schools.length === 0) {
      return res.status(400).json({ message: 'At least one school is required to create a plan' })
    }
    if (!checklist || !Array.isArray(checklist.infrastructure) || !Array.isArray(checklist.academic) || !Array.isArray(checklist.governmentSchemes) || !Array.isArray(checklist.safety)) {
      return res.status(400).json({ message: 'Complete checklist is required' })
    }

    const plan = new InspectionPlan({
      createdBy: req.user.userId,
      title,
      description,
      schools,
      checklist,
      plannedStartDate,
      plannedEndDate,
    })

    await plan.save()
    res.status(201).json({ success: true, message: 'Inspection plan created', plan })
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan', error: error.message })
  }
}

exports.getInspectionPlans = async (req, res) => {
  try {
    const plans = await InspectionPlan.find({ createdBy: req.user.userId }).populate('schools')
    res.json(plans)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message })
  }
}

exports.assignSchools = async (req, res) => {
  try {
    const { planId, assignments } = req.body

    if (!planId || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ message: 'Plan ID and assignments are required' })
    }

    const plan = await InspectionPlan.findById(planId)
    if (!plan) {
      return res.status(404).json({ message: 'Inspection plan not found' })
    }
    if (plan.status !== 'SIGNED') {
      return res.status(400).json({ message: 'Plan must be signed before assigning schools' })
    }

    const planSchoolIds = (plan.schools || []).map((id) => String(id))

    for (const assignment of assignments) {
      const { userId, schools, deadline } = assignment
      if (!userId || !Array.isArray(schools) || schools.length === 0) {
        return res.status(400).json({ message: 'Each assignment needs userId and at least one school' })
      }

      for (const schoolId of schools) {
        if (!planSchoolIds.includes(String(schoolId))) {
          return res.status(400).json({ message: 'Assigned schools must belong to the selected plan' })
        }

        // Create or update DEO inspection task so it appears in DEO dashboard/list.
        await Inspection.findOneAndUpdate(
          {
            inspectionPlanId: planId,
            schoolId,
            inspectorId: userId,
          },
          {
            inspectionPlanId: planId,
            schoolId,
            inspectorId: userId,
            deadline: deadline ? new Date(deadline) : null,
            status: 'PENDING',
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        )
      }
    }

    plan.assignedTo = assignments
    await plan.save()

    res.json({ success: true, message: 'Schools assigned', plan })
  } catch (error) {
    res.status(500).json({ message: 'Error assigning schools', error: error.message })
  }
}

exports.signPlan = async (req, res) => {
  try {
    const { planId, otpVerified } = req.body

    if (!otpVerified) {
      return res.status(400).json({ message: 'OTP verification required' })
    }

    const plan = await InspectionPlan.findByIdAndUpdate(
      planId,
      {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: req.user.userId,
        otpVerified: true,
      },
      { new: true }
    )

    res.json({ success: true, message: 'Plan digitally signed', plan })
  } catch (error) {
    res.status(500).json({ message: 'Error signing plan', error: error.message })
  }
}

exports.getReports = async (req, res) => {
  try {
    const { district, startDate, endDate } = req.query

    const filter = {
      status: 'COMPLETED',
    }

    if (startDate && endDate) {
      filter.endTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const inspections = await Inspection.find(filter)
      .populate('schoolId')
      .populate('inspectionPlanId')
      .populate('inspectorId')
      .sort({ endTime: -1, createdAt: -1 })

    const reports = inspections
      .filter((inspection) => !district || inspection.schoolId?.district === district)
      .map((inspection) => ({
        _id: inspection._id,
        schoolName: inspection.schoolId?.name || 'Unknown School',
        planTitle: inspection.inspectionPlanId?.title || 'Inspection Plan',
        inspectorName: inspection.inspectorId?.name || 'N/A',
        status: inspection.status,
        date: inspection.submittedAt || inspection.endTime || inspection.createdAt,
      }))

    res.json(reports)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message })
  }
}

exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('schoolId')
      .populate('createdBy')
      .sort({ priority: -1, createdAt: -1 })

    res.json(issues)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues', error: error.message })
  }
}

exports.getDeoUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: 'DEO/BEO',
    })
      .select('_id name employeeId district block role')
      .sort({ name: 1, employeeId: 1 })

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching DEO/BEO users', error: error.message })
  }
}

exports.getLiveInspectorLocations = async (req, res) => {
  try {
    // Get all in-progress inspections with live location data
    const activeInspections = await Inspection.find({
      status: 'IN_PROGRESS',
      currentLocation: { $exists: true },
    })
      .populate('inspectorId', 'name employeeId')
      .populate('schoolId', 'name latitude longitude')
      .select('_id inspectorId schoolId currentLocation startLocation inspector status')
      .sort({ 'currentLocation.timestamp': -1 })

    // Format the response
    const inspectorLocations = activeInspections
      .filter((insp) => insp.currentLocation && insp.currentLocation.latitude && insp.currentLocation.longitude)
      .map((inspection) => ({
        inspectionId: inspection._id,
        inspectorId: inspection.inspectorId._id,
        inspectorName: inspection.inspectorId.name,
        inspectorEmployeeId: inspection.inspectorId.employeeId,
        schoolName: inspection.schoolId?.name || 'Unknown School',
        schoolLocation: {
          latitude: inspection.schoolId?.latitude,
          longitude: inspection.schoolId?.longitude,
        },
        currentLocation: {
          latitude: inspection.currentLocation.latitude,
          longitude: inspection.currentLocation.longitude,
          accuracy: inspection.currentLocation.accuracy,
          timestamp: inspection.currentLocation.timestamp,
        },
        startLocation: inspection.startLocation,
        distance: calculateDEOSchoolDistance(
          inspection.currentLocation.latitude,
          inspection.currentLocation.longitude,
          inspection.schoolId?.latitude,
          inspection.schoolId?.longitude
        ),
      }))

    res.json({
      success: true,
      total: inspectorLocations.length,
      locations: inspectorLocations,
    })
  } catch (error) {
    console.error('Error fetching inspector locations:', error)
    res.status(500).json({
      message: 'Error fetching inspector locations',
      error: error.message,
    })
  }
}

// Helper function to calculate distance between two coordinates
function calculateDEOSchoolDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c * 1000).toFixed(0) // Return distance in meters
}

exports.getInspectionPhotos = async (req, res) => {
  try {
    const { inspectionId } = req.params

    if (!inspectionId) {
      return res.status(400).json({ message: 'Inspection ID is required' })
    }

    const inspection = await Inspection.findById(inspectionId)
      .populate('schoolId', 'name latitude longitude')
      .populate('inspectorId', 'name employeeId')

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    const photos = inspection.photos || []

    if (photos.length === 0) {
      return res.json({
        success: true,
        message: 'No photos uploaded yet',
        inspectionId,
        inspection: {
          _id: inspection._id,
          schoolName: inspection.schoolId?.name,
          inspectorName: inspection.inspectorId?.name,
          inspectorId: inspection.inspectorId?.employeeId,
          status: inspection.status,
        },
        photos: [],
      })
    }

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      url: photo.url,
      filename: photo.filename,
      timestamp: photo.timestamp,
      latitude: photo.latitude,
      longitude: photo.longitude,
      accuracy: photo.accuracy,
    }))

    res.json({
      success: true,
      count: formattedPhotos.length,
      inspectionId,
      inspection: {
        _id: inspection._id,
        schoolName: inspection.schoolId?.name,
        schoolLocation: {
          latitude: inspection.schoolId?.latitude,
          longitude: inspection.schoolId?.longitude,
        },
        inspectorName: inspection.inspectorId?.name,
        inspectorId: inspection.inspectorId?.employeeId,
        status: inspection.status,
        startTime: inspection.startTime,
        endTime: inspection.endTime,
      },
      photos: formattedPhotos,
    })
  } catch (error) {
    console.error('Error fetching inspection photos:', error)
    res.status(500).json({
      message: 'Error fetching inspection photos',
      error: error.message,
    })
  }
}

exports.getAllInspectionsWithPhotos = async (req, res) => {
  try {
    // Get all inspections with at least one photo
    const inspections = await Inspection.find({
      photos: { $exists: true, $ne: [] },
    })
      .populate('schoolId', 'name latitude longitude')
      .populate('inspectorId', 'name employeeId')
      .sort({ 'photos[0].timestamp': -1 })

    const result = inspections.map((inspection) => ({
      _id: inspection._id,
      schoolName: inspection.schoolId?.name || 'Unknown School',
      inspectorName: inspection.inspectorId?.name || 'Unknown Inspector',
      inspectorId: inspection.inspectorId?.employeeId,
      photoCount: inspection.photos.length,
      lastPhotoTime: inspection.photos[inspection.photos.length - 1]?.timestamp,
      status: inspection.status,
      firstPhotoUrl: inspection.photos[0]?.url,
    }))

    res.json({
      success: true,
      total: result.length,
      inspections: result,
    })
  } catch (error) {
    console.error('Error fetching inspections with photos:', error)
    res.status(500).json({
      message: 'Error fetching inspections with photos',
      error: error.message,
    })
  }
}

exports.getReportDetails = async (req, res) => {
  try {
    const { inspectionId } = req.params

    if (!inspectionId) {
      return res.status(400).json({ message: 'inspectionId is required' })
    }

    // Get detailed inspection data including all location updates
    const inspection = await Inspection.findById(inspectionId)
      .populate('schoolId', 'name latitude longitude district')
      .populate('inspectorId', 'name employeeId phoneNumber email')
      .populate('inspectionPlanId', 'title')

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    // Format response with all inspection data
    res.json({
      success: true,
      inspection: {
        _id: inspection._id,
        schoolName: inspection.schoolId?.name || 'Unknown School',
        schoolLocation: {
          latitude: inspection.schoolId?.latitude,
          longitude: inspection.schoolId?.longitude,
          district: inspection.schoolId?.district,
        },
        inspectorName: inspection.inspectorId?.name || 'Unknown Inspector',
        inspectorId: inspection.inspectorId?.employeeId,
        inspectorEmail: inspection.inspectorId?.email,
        planTitle: inspection.inspectionPlanId?.title || 'Inspection Plan',
        status: inspection.status,
        startTime: inspection.startTime,
        endTime: inspection.endTime,
        submittedAt: inspection.submittedAt,
        findings: inspection.findings,
        recommendations: inspection.recommendations,
        overallRating: inspection.overallRating,
        // Photos with geolocation
        photos: (inspection.photos || []).map((photo) => ({
          _id: photo._id,
          url: photo.url,
          filename: photo.filename,
          timestamp: photo.timestamp,
          latitude: photo.latitude,
          longitude: photo.longitude,
          accuracy: photo.accuracy,
        })),
        // GPS locations from inspection
        gpsLocations: (inspection.gpsLocations || []).map((loc) => ({
          _id: loc._id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          accuracy: loc.accuracy,
        })),
        // Location history from location tracking
        locationHistory: (inspection.locationHistory || []).map((loc) => ({
          _id: loc._id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          accuracy: loc.accuracy,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching report details:', error)
    res.status(500).json({
      message: 'Error fetching report details',
      error: error.message,
    })
  }
}
