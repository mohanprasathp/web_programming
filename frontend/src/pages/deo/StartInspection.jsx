import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deoService } from '../../services/api'
import { getGPS, calculateDistance } from '../../utils/gps'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const StartInspection = () => {
  const { inspectionId } = useParams()
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [loading, setLoading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await deoService.getInspections()
        const assigned = response.data || []
        setInspections(assigned)

        if (inspectionId) {
          const found = assigned.find((item) => item._id === inspectionId)
          if (found) {
            setSelectedInspection(found)
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load inspections')
      }
    }

    fetchInspections()
  }, [inspectionId])

  const handleRequestGPS = async () => {
    setLoading(true)
    setError('')
    setGpsStatus('requesting')

    try {
      const location = await getGPS()
      setGpsStatus('acquired')

      if (!selectedInspection) {
        setError('Please select an inspection first')
        setLoading(false)
        return
      }

      // Verify distance (100 meters)
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        selectedInspection.schoolId.latitude,
        selectedInspection.schoolId.longitude
      )

      if (distance > 100) {
        setError(
          `You are ${distance.toFixed(2)}m away from school. Must be within 100m.`
        )
        setGpsStatus('error')
        setLoading(false)
        return
      }

      // Start inspection
      const response = await deoService.startInspection({
        inspectionId: selectedInspection._id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      })

      if (response.data.success) {
        setSuccess('Inspection started successfully! Redirecting...')
        setTimeout(() => {
          navigate(`/deo/inspection-form/${selectedInspection._id}`)
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start inspection')
      setGpsStatus('error')
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Start Inspection</h1>

            {/* GPS Status Card */}
            <div className="card mb-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold mb-4">GPS Verification</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      gpsStatus === 'acquired'
                        ? 'bg-green-500'
                        : gpsStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span className="text-gray-700">
                    {gpsStatus === 'idle' && 'Ready to request GPS'}
                    {gpsStatus === 'requesting' && 'Requesting GPS location...'}
                    {gpsStatus === 'acquired' && 'GPS location acquired'}
                    {gpsStatus === 'error' && 'GPS verification failed'}
                  </span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Selection */}
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">Select Inspection</h2>
              <div className="space-y-2">
                <select
                  value={selectedInspection?._id || ''}
                  onChange={(e) => {
                    const found = inspections.find((i) => i._id === e.target.value)
                    setSelectedInspection(found)
                  }}
                  className="input-field"
                >
                  <option value="">Choose an inspection...</option>
                  {inspections.map((inspection) => (
                    <option key={inspection._id} value={inspection._id}>
                      {inspection.schoolId?.name || 'Unknown School'} -{' '}
                      {inspection.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInspection && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-gray-700">
                    <strong>School:</strong> {selectedInspection.schoolId.name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong> {selectedInspection.status}
                  </p>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleRequestGPS}
              disabled={loading || !selectedInspection}
              className="w-full btn btn-success font-semibold py-3 disabled:opacity-50"
            >
              {loading ? 'Requesting GPS...' : '📍 Request GPS & Start Inspection'}
            </button>

            <p className="text-center text-gray-600 text-sm mt-4">
              You must be within 100 meters of the school to start inspection
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartInspection
