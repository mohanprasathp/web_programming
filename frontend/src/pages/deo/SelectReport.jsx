import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const SelectReport = () => {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const response = await deoService.getInspections()
      // Show only in-progress inspections for report submission.
      const inProgress = (response.data || []).filter((i) => i.status === 'IN_PROGRESS')
      setInspections(inProgress)
    } catch (err) {
      console.error('Error fetching inspections:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Report</h1>
            <p className="text-gray-900 font-semibold mb-6">Select an inspection to submit report</p>

            {loading ? (
              <p className="text-gray-600">Loading inspections...</p>
            ) : inspections.length === 0 ? (
              <p className="text-gray-600">No in-progress inspections to submit</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inspections.map((inspection) => (
                  <div key={inspection._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{inspection.schoolId?.name || '-'}</h3>
                    <p className="text-gray-600 mb-2"><strong>Status:</strong> {inspection.status}</p>
                    <p className="text-gray-600 mb-4">
                      <strong>Started:</strong>{' '}
                      {inspection.startTime ? new Date(inspection.startTime).toLocaleDateString() : '-'}
                    </p>
                    <button
                      onClick={() => navigate(`/deo/submit-report/${inspection._id}`)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Submit Report
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

export default SelectReport
