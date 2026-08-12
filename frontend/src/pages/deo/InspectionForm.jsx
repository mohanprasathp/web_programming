import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { deoService, inspectionService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const InspectionForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { inspectionId: inspectionIdFromParams } = useParams()
  const { inspectionId: inspectionIdFromState } = location.state || {}
  const inspectionId = inspectionIdFromParams || inspectionIdFromState

  const [formData, setFormData] = useState({
    infrastructure: '',
    academic: '',
    governmentSchemes: '',
    safety: '',
    remarks: '',
  })

  const [loading, setLoading] = useState(false)
  const [inspectionReady, setInspectionReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAccess = async () => {
      if (!inspectionId) {
        setError('Inspection ID missing. Please start inspection from the list.')
        return
      }
      try {
        const response = await inspectionService.getInspection(inspectionId)
        if (response.data?.status !== 'IN_PROGRESS') {
          setError('You must start inspection before accessing this form.')
          return
        }
        setInspectionReady(true)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to validate inspection access')
      }
    }
    checkAccess()
  }, [inspectionId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const checklistComplete =
    formData.infrastructure.length >= 5 &&
    formData.academic.length >= 5 &&
    formData.governmentSchemes.length >= 5 &&
    formData.safety.length >= 5

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checklistComplete) {
      setError(
        'Each checklist section (Infrastructure, Academic, Government Schemes, Safety) needs at least 5 characters before you can save. Overall remarks are optional.'
      )
      return
    }
    setLoading(true)
    setError('')

    try {
      const response = await deoService.submitChecklist({
        inspectionId,
        checklist: {
          infrastructure: formData.infrastructure,
          academic: formData.academic,
          governmentSchemes: formData.governmentSchemes,
          safety: formData.safety,
        },
        remarks: formData.remarks,
      })

      if (response.data?.success) {
        navigate(`/deo/create-issues/${inspectionId}`)
      } else {
        setError('Save did not complete. Please try again.')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error submitting form'
      const details = err.response?.data?.details
      
      if (details && Array.isArray(details)) {
        const detailsText = details.join('\n• ')
        setError(`${errorMessage}\n\nDetails:\n• ${detailsText}`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              📋 School Inspection Checklist Form
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
                {error}
              </div>
            )}

            {!inspectionReady ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                ⏳ Validating your inspection access...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Infrastructure */}
                <div className="card">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-gray-700 font-bold text-lg">
                      🏗️ Infrastructure Assessment
                    </label>
                    <span className={`text-sm ${formData.infrastructure.length < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.infrastructure.length} / 5 (min)
                    </span>
                  </div>
                  <textarea
                    name="infrastructure"
                    value={formData.infrastructure}
                    onChange={handleChange}
                    rows="5"
                    className="input-field w-full"
                    placeholder="Evaluate buildings, classrooms, labs, library, sports facilities, sanitation, water supply, etc..."
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Provide detailed assessment of physical infrastructure (minimum 5 characters)
                  </p>
                </div>

                {/* Academic */}
                <div className="card">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-gray-700 font-bold text-lg">
                      📚 Academic Standards & Teaching Quality
                    </label>
                    <span className={`text-sm ${formData.academic.length < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.academic.length} / 5 (min)
                    </span>
                  </div>
                  <textarea
                    name="academic"
                    value={formData.academic}
                    onChange={handleChange}
                    rows="5"
                    className="input-field w-full"
                    placeholder="Teaching methods, curriculum implementation, student assessment, learning outcomes, teacher competency, etc..."
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Evaluate teaching methods and academic performance (minimum 5 characters)
                  </p>
                </div>

                {/* Government Schemes */}
                <div className="card">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-gray-700 font-bold text-lg">
                      🏛️ Government Schemes Implementation
                    </label>
                    <span className={`text-sm ${formData.governmentSchemes.length < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.governmentSchemes.length} / 5 (min)
                    </span>
                  </div>
                  <textarea
                    name="governmentSchemes"
                    value={formData.governmentSchemes}
                    onChange={handleChange}
                    rows="5"
                    className="input-field w-full"
                    placeholder="Mid-day meal scheme, scholarships, PMPOSHAN, digital literacy, counseling services, etc..."
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Assess implementation of government schemes (minimum 5 characters)
                  </p>
                </div>

                {/* Safety */}
                <div className="card">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-gray-700 font-bold text-lg">
                      🛡️ Safety, Security & Well-being
                    </label>
                    <span className={`text-sm ${formData.safety.length < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.safety.length} / 5 (min)
                    </span>
                  </div>
                  <textarea
                    name="safety"
                    value={formData.safety}
                    onChange={handleChange}
                    rows="5"
                    className="input-field w-full"
                    placeholder="Safety protocols, emergency preparedness, security measures, CCTV, staff training, student welfare, grievance redressal, etc..."
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Evaluate safety and security measures (minimum 5 characters)
                  </p>
                </div>

                {/* Remarks */}
                <div className="card">
                  <label className="block text-gray-700 font-bold text-lg mb-3">
                    📝 Overall Remarks & Recommendations
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="4"
                    className="input-field w-full"
                    placeholder="General observations, strengths, areas for improvement, recommendations for the school..."
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Optional: Provide overall insights and suggestions
                  </p>
                </div>

                {!checklistComplete && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    Save stays disabled until all four sections above have at least 5 characters each. Only the overall
                    remarks box at the bottom is optional.
                  </p>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !checklistComplete}
                    className="flex-1 btn btn-success font-semibold py-3 disabled:opacity-50"
                  >
                    {loading ? '⏳ Saving...' : '✓ Save Checklist & Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/deo')}
                    className="flex-1 btn btn-secondary font-semibold py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InspectionForm
