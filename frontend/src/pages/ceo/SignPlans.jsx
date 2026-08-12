import { useState, useEffect } from 'react'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const SignPlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleSign = async (planId) => {
    try {
      await ceoService.signPlan({ planId, otpVerified: true })
      fetchPlans()
    } catch (err) {
      console.error('Error signing plan:', err)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign Inspection Plans</h1>
            
            {loading ? (
              <p className="text-gray-600">Loading plans...</p>
            ) : plans.length === 0 ? (
              <p className="text-gray-600">No inspection plans available</p>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Plan Title</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Created Date</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700">{plan.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            plan.status === 'DRAFT' ? 'bg-blue-100 text-blue-800' :
                            plan.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {plan.status !== 'SIGNED' && (
                            <button
                              onClick={() => handleSign(plan._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                              Sign
                            </button>
                          )}
                          {plan.status === 'SIGNED' && (
                            <span className="text-green-600 font-semibold">Signed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignPlans
