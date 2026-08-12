import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'

const InspectionsList = () => {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const response = await deoService.getInspections()
      setInspections(response.data)
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-900 font-semibold">Loading inspections...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assigned Inspections</h1>
        <button
          onClick={() => navigate('/deo')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {inspections.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-900 font-semibold mb-4">No inspections assigned yet</p>
          <button
            onClick={() => navigate('/deo')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div key={inspection._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {inspection.schoolId?.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>UDISE Code:</strong> {inspection.schoolId?.udiseCode}
                    </div>
                    <div>
                      <strong>Location:</strong> {inspection.schoolId?.district},
                      {inspection.schoolId?.block}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`ml-2 px-3 py-1 rounded text-white ${
                        inspection.status === 'PENDING' ? 'bg-yellow-600' :
                        inspection.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                        'bg-green-600'
                      }`}>
                        {inspection.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (inspection.status === 'PENDING') {
                      navigate(`/deo/start-inspection/${inspection._id}`)
                    } else {
                      navigate(`/deo/inspection-form/${inspection._id}`)
                    }
                  }}
                  className="btn btn-primary ml-4"
                >
                  {inspection.status === 'PENDING' ? 'Start Inspection' : 'Continue'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InspectionsList
