import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { deoService } from '../../services/api'
import { getGPS } from '../../utils/gps'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const SubmitReport = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { inspectionId: inspectionIdFromParams } = useParams()
  const { inspectionId: inspectionIdFromState, issuesCreated } = location.state || {}
  const inspectionId = inspectionIdFromParams || inspectionIdFromState

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleRequestOtp = async () => {
    try {
      if (!inspectionId) {
        setError('Inspection ID is missing. Please select inspection again.')
        return
      }
      const response = await deoService.requestReportOtp(inspectionId)
      setOtpSent(true)
      setError('')

      // Show OTP only in development mode
      if (process.env.NODE_ENV === 'development' && response.data.otp) {
        setSuccess(
          `✅ OTP sent to your registered email/SMS. Test OTP: ${response.data.otp}`
        )
      } else {
        setSuccess('✅ OTP sent to your registered email/SMS. Check your inbox.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP')
      setOtpSent(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      if (!inspectionId) {
        setError('Inspection ID is missing. Please select inspection again.')
        setLoading(false)
        return
      }

      let gpsLocation
      try {
        gpsLocation = await getGPS()
      } catch (gpsErr) {
        setError(
          gpsErr?.message ||
            'Could not read GPS for this submission. Allow location access and try again.'
        )
        setLoading(false)
        return
      }

      const response = await deoService.submitReport({
        inspectionId,
        endLatitude: Number(gpsLocation.latitude),
        endLongitude: Number(gpsLocation.longitude),
        otp: String(otp).trim(),
      })

      if (response.data.success) {
        setSuccess('Report submitted successfully!')
        setTimeout(() => {
          navigate('/deo')
        }, 2000)
      } else {
        setError('Submit did not complete. Please try again.')
      }
    } catch (err) {
      const data = err.response?.data
      const details = data?.details
      const base = data?.message || err.message || 'Error submitting report'
      if (Array.isArray(details) && details.length > 0) {
        setError(`${base}\n\n• ${details.join('\n• ')}`)
      } else {
        setError(base)
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Report</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            {/* Summary */}
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">Inspection Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Issues Created:</span>
                  <span className="font-bold text-orange-600">{issuesCreated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Status:</span>
                  <span className="font-bold text-blue-600">Ready to Submit</span>
                </div>
              </div>
            </div>

            {/* Submission Note */}
            <div className="card mb-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold mb-4">Submission Note</h2>
              <p className="text-gray-700 mb-4">
                Your report will be submitted with your authenticated account and current GPS
                location.
              </p>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                <p className="text-sm">
                  <strong>Note:</strong> OTP is required for digital signature simulation.
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  Request OTP
                </button>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="input-field max-w-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !otpSent || otp.length !== 6}
                className="flex-1 btn btn-success font-semibold py-3"
              >
                {loading ? 'Submitting...' : '✓ Submit Report'}
              </button>
              <button
                onClick={() => navigate('/deo')}
                disabled={loading}
                className="flex-1 btn btn-secondary font-semibold py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitReport
