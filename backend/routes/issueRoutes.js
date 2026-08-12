const express = require('express')
const { auth, roleCheck } = require('../middleware/auth')
const Issue = require('../models/Issue')
const deoController = require('../controllers/deoController')

const router = express.Router()

router.use(auth)

// REST-style aliases
router.post('/create', roleCheck(['DEO/BEO']), deoController.createIssue)
router.put('/resolve', roleCheck(['HEADMASTER']), async (req, res) => {
  try {
    const { issueId } = req.body
    if (!issueId) {
      return res.status(400).json({ message: 'issueId is required' })
    }
    const issue = await Issue.findByIdAndUpdate(
      issueId,
      {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: req.user.userId,
      },
      { new: true }
    )
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }
    res.json({ success: true, issue })
  } catch (error) {
    res.status(500).json({ message: 'Error resolving issue', error: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('schoolId')
      .populate('createdBy')
    res.json(issues)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues', error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('schoolId')
      .populate('createdBy')
      .populate('correctiveActions.createdBy')
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }
    res.json(issue)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issue', error: error.message })
  }
})

module.exports = router
