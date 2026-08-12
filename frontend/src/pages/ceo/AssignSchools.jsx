import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const AssignSchools = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [deoUsers, setDeoUsers] = useState([])
  const [planSchools, setPlanSchools] = useState([])
  const [selectedDEO, setSelectedDEO] = useState('')
  const [selectedSchools, setSelectedSchools] = useState([])
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPlanAndData()
  }, [planId])

  const fetchPlanAndData = async () => {
    try {
      setLoading(true)
      // Fetch plans and select the requested plan
      const plansRes = await ceoService.getPlans()
      const selectedPlan = plansRes.data.find((item) => item._id === planId)
      setPlan(selectedPlan || null)
      setPlanSchools(selectedPlan?.schools || [])

      // Fetch active DEO/BEO users
      const usersRes = await ceoService.getUsers()
      setDeoUsers(usersRes.data)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSchoolToggle = (schoolId) => {
    setSelectedSchools(prev =>
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    )
  }

  const handleAssign = async () => {
    if (!selectedDEO || selectedSchools.length === 0 || !deadline) {
      setError('Please select a DEO, at least one school, and a deadline')
      return
    }

    try {
      await ceoService.assignSchools({
        planId,
        assignments: [
          {
            userId: selectedDEO,
            schools: selectedSchools,
            deadline,
          },
        ],
      })
      setSuccess('Schools assigned successfully!')
      setTimeout(() => navigate('/ceo'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign schools')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar userRole="CEO" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-900 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Assign Schools</h1>
              <p className="text-gray-900 font-semibold mt-2">Plan: {plan?.title}</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select DEO / BEO Officer
                </label>
                <select
                  value={selectedDEO}
                  onChange={(e) => setSelectedDEO(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {deoUsers.length === 0
                      ? 'No DEO/BEO officers found in database'
                      : 'Choose a DEO/BEO officer...'}
                  </option>
                  {deoUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.employeeId} ({user.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Schools from Plan
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {planSchools.map((school) => (
                    <label key={school._id} className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSchools.includes(school._id)}
                        onChange={() => handleSchoolToggle(school._id)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-gray-900 font-semibold">
                        {school.name} ({school.udiseCode})
                      </span>
                    </label>
                  ))}
                  {planSchools.length === 0 && (
                    <p className="text-sm text-gray-600">No schools are selected in this plan.</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAssign}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Assign Schools
                </button>
                <button
                  onClick={() => navigate('/ceo')}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignSchools
