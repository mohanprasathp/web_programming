const express = require('express')
const headmasterController = require('../controllers/headmasterController')
const { auth, roleCheck } = require('../middleware/auth')

const router = express.Router()

router.use(auth)
router.use(roleCheck(['HEADMASTER']))

router.get('/dashboard', headmasterController.getDashboard)
router.get('/reports', headmasterController.getReports)
router.get('/issues', headmasterController.getIssues)
router.post('/add-corrective-action', headmasterController.addCorrectiveAction)
router.post('/request-extension', headmasterController.requestExtension)
router.post('/mark-issue-resolved', headmasterController.markIssueResolved)

module.exports = router
