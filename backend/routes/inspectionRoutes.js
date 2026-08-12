const express = require('express')
const { auth, roleCheck } = require('../middleware/auth')
const Inspection = require('../models/Inspection')
const deoController = require('../controllers/deoController')

const router = express.Router()

router.use(auth)

// REST-style aliases for inspection workflow
router.post('/start', roleCheck(['DEO/BEO']), deoController.startInspection)
router.post('/submit', roleCheck(['DEO/BEO']), deoController.submitReport)
router.post('/update-location', roleCheck(['DEO/BEO']), deoController.updateLocation)

router.get('/', async (req, res) => {
  try {
    const inspections = await Inspection.find().populate('schoolId').populate('inspectorId')
    res.json(inspections)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inspections', error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('schoolId')
      .populate('inspectorId')
      .populate('issues')
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }
    res.json(inspection)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inspection', error: error.message })
  }
})

module.exports = router
