import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ceoService, schoolService } from '../../services/api'

const CreateInspectionPlan = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [schools, setSchools] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schools: [],
    plannedStartDate: '',
    plannedEndDate: '',
    checklist: {
      infrastructure: [''],
      academic: [''],
      governmentSchemes: [''],
      safety: [''],
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await schoolService.getSchools()
        setSchools(response.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load schools')
      }
    }

    fetchSchools()
  }, [])

  const handleSchoolToggle = (schoolId) => {
    setFormData((prev) => ({
      ...prev,
      schools: prev.schools.includes(schoolId)
        ? prev.schools.filter((id) => id !== schoolId)
        : [...prev.schools, schoolId],
    }))
  }

  const handleChecklistChange = (category, index, value) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: prev.checklist[category].map((item, i) =>
          i === index ? value : item
        ),
      },
    }))
  }

  const addChecklistItem = (category) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: [...prev.checklist[category], ''],
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (formData.schools.length === 0) {
        setError('Please select at least one school for this plan')
        setSubmitting(false)
        return
      }

      const response = await ceoService.createPlan(formData)

      navigate(`/ceo/assign-schools/${response.data.plan._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create inspection plan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 bg-white min-h-screen">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Inspection Plan</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold text-gray-900 mb-2">Plan Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="E.g., Primary Schools Q2 2024 Inspection"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Brief description of the inspection plan"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-900 mb-2">Planned Start Date</label>
              <input
                type="date"
                name="plannedStartDate"
                value={formData.plannedStartDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-900 mb-2">Planned End Date</label>
              <input
                type="date"
                name="plannedEndDate"
                value={formData.plannedEndDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-2">Select Schools *</label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-56 overflow-y-auto bg-white">
              {schools.length === 0 ? (
                <p className="text-sm text-gray-900 font-semibold">No schools found in database</p>
              ) : (
                schools.map((school) => (
                  <label key={school._id} className="flex items-center mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.schools.includes(school._id)}
                      onChange={() => handleSchoolToggle(school._id)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-900 font-semibold">
                      {school.name} ({school.udiseCode})
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-sm text-gray-900 font-semibold mt-2">
              Selected schools: {formData.schools.length}
            </p>
          </div>

          {/* Checklist sections */}
          {Object.keys(formData.checklist).map((category) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className="space-y-2 mb-3">
                {formData.checklist[category].map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleChecklistChange(category, index, e.target.value)
                    }
                    className="input-field w-full"
                    placeholder={`Checklist item ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => addChecklistItem(category)}
                className="text-blue-600 text-sm font-semibold hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn btn-success font-semibold py-3"
            >
              {submitting ? 'Creating...' : '➕ Create Plan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/ceo')}
              className="flex-1 btn btn-secondary font-semibold py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInspectionPlan
