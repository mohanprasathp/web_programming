const express = require('express')
const router = express.Router()
const { auth, roleCheck } = require('../middleware/auth')
const AnalyticsService = require('../services/analyticsService')

// All analytics endpoints require authentication
router.use(auth)

// Get inspection metrics
router.get('/inspections', roleCheck(['CEO']), async (req, res) => {
  try {
    const { planId, schoolId } = req.query
    const metrics = await AnalyticsService.getInspectionMetrics(
      planId,
      schoolId
    )
    res.json({
      success: true,
      data: metrics,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection metrics',
      error: err.message,
    })
  }
})

// Get issue metrics
router.get('/issues', roleCheck(['CEO', 'HEADMASTER']), async (req, res) => {
  try {
    const { planId, schoolId } = req.query
    const metrics = await AnalyticsService.getIssueMetrics(planId, schoolId)
    res.json({
      success: true,
      data: metrics,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue metrics',
      error: err.message,
    })
  }
})

// Get compliance metrics
router.get('/compliance', async (req, res) => {
  try {
    const schoolId = req.userRole === 'HEADMASTER' ? req.userId : req.query.schoolId
    const metrics = await AnalyticsService.getComplianceMetrics(schoolId)
    res.json({
      success: true,
      data: metrics,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance metrics',
      error: err.message,
    })
  }
})

// Get school performance ranking
router.get('/school-performance', roleCheck(['CEO']), async (req, res) => {
  try {
    const performance = await AnalyticsService.getSchoolPerformance()
    res.json({
      success: true,
      data: performance,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school performance data',
      error: err.message,
    })
  }
})

// Get trend analysis
router.get('/trends', roleCheck(['CEO']), async (req, res) => {
  try {
    const { days = 30 } = req.query
    const trends = await AnalyticsService.getTrendAnalytics(parseInt(days))
    res.json({
      success: true,
      data: trends,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trend data',
      error: err.message,
    })
  }
})

// Export analytics report
router.get('/export', roleCheck(['CEO']), async (req, res) => {
  try {
    const { format = 'json', planId, schoolId, days = 30 } = req.query
    const filters = { planId, schoolId, days: parseInt(days) }
    const report = await AnalyticsService.exportAnalyticsReport(
      format,
      filters
    )

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"')
      res.send(report)
    } else {
      res.json({
        success: true,
        data: report,
      })
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: err.message,
    })
  }
})

module.exports = router
