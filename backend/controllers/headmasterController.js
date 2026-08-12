const Issue = require('../models/Issue')
const Inspection = require('../models/Inspection')
const School = require('../models/School')
const User = require('../models/User')
const mongoose = require('mongoose')

const isStrictObjectId = (value) => {
  if (!value || typeof value !== 'string') return false
  const s = value.trim()
  if (s.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(s)) return false
  try {
    return String(new mongoose.Types.ObjectId(s)) === s
  } catch {
    return false
  }
}

const resolveHeadmasterSchool = async (userId) => {
  const user = await User.findById(userId).select('school')
  if (!user || user.school === undefined || user.school === null || String(user.school).trim() === '') {
    return null
  }

  const raw = String(user.school).trim()

  if (isStrictObjectId(raw)) {
    const byId = await School.findById(raw)
    if (byId) return byId
  }

  let school = await School.findOne({ name: raw })
  if (school) return school

  school = await School.findOne({ udiseCode: raw })
  if (school) return school

  // Legacy seed mistake: "123456" was used as a placeholder (OTP hint), not a school id or UDISE
  if (raw === '123456') {
    const fallback = await School.findOne({ name: 'Habitat Hostel' })
    if (fallback) return fallback
  }

  return null
}

exports.getDashboard = async (req, res) => {
  try {
    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const reportsReceived = await Inspection.countDocuments({
      schoolId: school._id,
      status: 'COMPLETED',
    })
    const pendingIssues = await Issue.countDocuments({
      schoolId: school._id,
      status: { $in: ['OPEN', 'IN_PROGRESS'] },
    })
    const resolvedIssues = await Issue.countDocuments({
      schoolId: school._id,
      status: 'RESOLVED',
    })
    const extensionRequests = await Issue.countDocuments({
      schoolId: school._id,
      'extensions.0': { $exists: true },
    })

    res.json({
      schoolName: school.name,
      reportsReceived,
      pendingIssues,
      resolvedIssues,
      extensionRequests,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message })
  }
}

exports.getReports = async (req, res) => {
  try {
    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const inspections = await Inspection.find({
      schoolId: school._id,
      status: 'COMPLETED',
    })
      .populate('inspectorId')
      .populate('schoolId')
      .populate('inspectionPlanId')
      .populate('issues')

    res.json(inspections)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message })
  }
}

exports.getIssues = async (req, res) => {
  try {
    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const issues = await Issue.find({
      schoolId: school._id,
    })
      .populate('createdBy')
      .populate('schoolId')
      .populate('correctiveActions.createdBy')

    res.json(issues)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues', error: error.message })
  }
}

exports.addCorrectiveAction = async (req, res) => {
  try {
    const { issueId, actionDescription, targetDate, proofPhotos, comments } = req.body
    if (!issueId || !actionDescription || !targetDate) {
      return res.status(400).json({ message: 'issueId, actionDescription and targetDate are required' })
    }

    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, schoolId: school._id },
      {
        $push: {
          correctiveActions: {
            actionDescription,
            targetDate,
            proofPhotos,
            comments,
            status: 'IN_PROGRESS',
            createdBy: req.user.userId,
            createdAt: new Date(),
          },
        },
        status: 'IN_PROGRESS',
      },
      { new: true }
    )
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found for this school' })
    }

    res.json({
      success: true,
      message: 'Corrective action added',
      issue,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error adding corrective action', error: error.message })
  }
}

exports.requestExtension = async (req, res) => {
  try {
    const { issueId, newDeadline, reason } = req.body
    if (!issueId || !newDeadline || !reason) {
      return res.status(400).json({ message: 'issueId, newDeadline and reason are required' })
    }

    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, schoolId: school._id },
      {
        $push: {
          extensions: {
            requestedBy: req.user.userId,
            newDeadline,
            reason,
            status: 'PENDING',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found for this school' })
    }

    res.json({
      success: true,
      message: 'Extension request submitted',
      issue,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error requesting extension', error: error.message })
  }
}

exports.markIssueResolved = async (req, res) => {
  try {
    const { issueId } = req.body
    if (!issueId) {
      return res.status(400).json({ message: 'issueId is required' })
    }

    const school = await resolveHeadmasterSchool(req.user.userId)
    if (!school) {
      return res.status(404).json({ message: 'Headmaster school is not configured' })
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, schoolId: school._id },
      {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: req.user.userId,
      },
      { new: true }
    )
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found for this school' })
    }

    res.json({
      success: true,
      message: 'Issue marked as resolved',
      issue,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error marking issue as resolved', error: error.message })
  }
}
