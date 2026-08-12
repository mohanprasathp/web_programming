const express = require('express')
const ceoController = require('../controllers/ceoController')
const { auth, roleCheck } = require('../middleware/auth')

const router = express.Router()

router.use(auth)
router.use(roleCheck(['CEO']))

router.get('/dashboard', ceoController.getDashboard)
router.post('/create-plan', ceoController.createInspectionPlan)
router.get('/plans', ceoController.getInspectionPlans)
router.get('/users', ceoController.getDeoUsers)
router.get('/live-locations', ceoController.getLiveInspectorLocations)
router.get('/photos/:inspectionId', ceoController.getInspectionPhotos)
router.get('/photos-inspections', ceoController.getAllInspectionsWithPhotos)
router.get('/report/:inspectionId', ceoController.getReportDetails)
router.post('/assign-schools', ceoController.assignSchools)
router.post('/sign-plan', ceoController.signPlan)
router.get('/reports', ceoController.getReports)
router.get('/issues', ceoController.getIssues)

module.exports = router
