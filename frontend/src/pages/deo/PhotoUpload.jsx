import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'
import { getGeoLocation } from '../../utils/geolocation'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const PhotoUpload = () => {
  const { inspectionId } = useParams()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentLocation, setCurrentLocation] = useState(null)

  const handleGetLocation = async () => {
    try {
      setError('')
      const location = await getGeoLocation()
      setCurrentLocation(location)
      setSuccess(
        `📍 Location acquired: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      )
    } catch (err) {
      setError('Failed to get location: ' + err.message)
      setCurrentLocation(null)
    }
  }

  const handlePhotoCapture = async (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) {
      return
    }

    if (!currentLocation) {
      setError('Please get your current location before uploading photos')
      return
    }

    for (const file of files) {
      setUploading(true)
      setError('')
      setSuccess('')

      try {
        // Create FormData properly for file upload
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('inspectionId', inspectionId)
        formData.append('latitude', currentLocation.latitude)
        formData.append('longitude', currentLocation.longitude)

        const response = await deoService.uploadPhoto(formData)

        if (response.data.success) {
          setPhotos((prev) => [...prev, response.data.photo])
          setSuccess(
            `✅ Photo uploaded successfully (${response.data.photo.timestamp})`
          )
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Failed to upload photo'
        )
      } finally {
        setUploading(false)
      }
    }

    // Reset file input
    e.target.value = null
  }

  const handleSkipPhotos = () => {
    if (
      window.confirm(
        'No photos uploaded. Continue to submit report anyway?'
      )
    ) {
      navigate(`/deo/submit-report/${inspectionId}`)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              📸 Upload Inspection Photos
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            {/* GPS Location Card */}
            <div className="card mb-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold mb-4">📍 GPS Location</h2>
              <button
                onClick={handleGetLocation}
                disabled={uploading}
                className="btn btn-primary mb-4 w-full"
              >
                {currentLocation ? '🔄 Refresh Location' : '📍 Get Current Location'}
              </button>

              {currentLocation && (
                <div className="p-4 bg-green-50 rounded-lg text-sm space-y-2">
                  <p>
                    <strong>Latitude:</strong> {currentLocation.latitude.toFixed(
                      6
                    )}
                  </p>
                  <p>
                    <strong>Longitude:</strong>{' '}
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Accuracy:</strong> ±
                    {currentLocation.accuracy.toFixed(2)} meters
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    All photos will be tagged with this location
                  </p>
                </div>
              )}
            </div>

            {/* Photo Upload Card */}
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">Select & Upload Photos</h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoCapture}
                disabled={!currentLocation || uploading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-600 mt-2">
                💡 Each photo will be automatically geo-tagged with your current
                location and timestamp
              </p>
            </div>

            {/* Uploaded Photos List */}
            {photos.length > 0 && (
              <div className="card mb-6">
                <h3 className="font-semibold mb-4 text-lg">
                  ✅ Uploaded Photos ({photos.length})
                </h3>
                <div className="space-y-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700">
                            Photo {idx + 1}
                          </p>
                          <p className="text-xs text-gray-600">
                            📅{' '}
                            {new Date(photo.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            📍 {photo.latitude?.toFixed(5)},
                            {photo.longitude?.toFixed(5)}
                          </p>
                        </div>
                        <div className="text-2xl">📷</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/deo/submit-report/${inspectionId}`)}
                className="flex-1 btn btn-success font-semibold py-3"
              >
                ➜ Submit Report
              </button>
              <button
                onClick={() => navigate('/deo')}
                className="flex-1 btn btn-secondary font-semibold py-3"
              >
                Cancel
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              Photos are optional but recommended for documentation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoUpload
