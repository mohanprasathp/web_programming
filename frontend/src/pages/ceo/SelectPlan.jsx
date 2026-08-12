import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const SelectPlan = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await ceoService.getPlans()
      setPlans(response.data)
    } catch (err) {
      console.error('Error fetching plans:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Select Inspection Plan</h1>
            <p className="text-gray-900 font-semibold mb-6">Choose a plan to assign schools and inspectors</p>
            
            {loading ? (
              <p className="text-gray-600">Loading plans...</p>
            ) : plans.length === 0 ? (
              <p className="text-gray-600">No inspection plans available. Create one first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div key={plan._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.title}</h3>
                    <p className="text-gray-600 mb-2"><strong>Schools:</strong> {plan.schools?.length || 0}</p>
                    <p className="text-gray-600 mb-2"><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
                      plan.status === 'DRAFT' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{plan.status}</span></p>
                    <p className="text-gray-600 mb-4"><strong>Created:</strong> {new Date(plan.createdAt).toLocaleDateString()}</p>
                    <button
                      onClick={() => navigate(`/ceo/assign-schools/${plan._id}`)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Assign Schools
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectPlan
