const express = require('express')
const deoController = require('../controllers/deoController')
const { auth, roleCheck } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

router.use(auth)
router.use(roleCheck(['DEO/BEO']))

router.get('/dashboard', deoController.getDashboard)
router.get('/inspections', deoController.getAssignedInspections)
router.post('/start-inspection', deoController.startInspection)
router.post('/upload-photo', upload.single('photo'), deoController.uploadPhoto)
router.post('/submit-checklist', deoController.submitChecklistAndRemarks)
router.post('/create-issue', deoController.createIssue)
router.post('/request-report-otp', deoController.requestReportOtp)
router.post('/submit-report', deoController.submitReport)

module.exports = router
