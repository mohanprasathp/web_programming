const express = require('express')
const { auth } = require('../middleware/auth')
const School = require('../models/School')

const router = express.Router()

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const schools = await School.find()
    res.json(schools)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schools', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const school = new School(req.body)
    await school.save()
    res.status(201).json(school)
  } catch (error) {
    res.status(500).json({ message: 'Error creating school', error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
    res.json(school)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching school', error: error.message })
  }
})

module.exports = router
