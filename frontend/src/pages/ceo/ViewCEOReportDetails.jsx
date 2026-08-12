import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { LocationMapCard } from '../../components/LocationMap'
import { ceoService } from '../../services/api'
import { MapPin, Camera, FileText, AlertCircle, RefreshCw, ArrowLeft, MapIcon, Image } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return ''
  // If it's already an absolute URL, return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl
  }
  // If it's a relative path, prepend the base URL
  return `${API_BASE_URL}${photoUrl}`
}

const ViewCEOReportDetails = () => {
  const navigate = useNavigate()
  const { inspectionId } = useParams()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    fetchReportDetails()
  }, [inspectionId])

  const fetchReportDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await ceoService.getReportDetails(inspectionId)
      setInspection(response.data.inspection)

      // Set first photo as selected if available
      if (response.data.inspection.photos?.length > 0) {
        setSelectedPhoto(response.data.inspection.photos[0])
      }

      // Set first location as selected if available
      if (response.data.inspection.locationHistory?.length > 0) {
        setSelectedLocation(response.data.inspection.locationHistory[0])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report details')
      console.error('Error fetching report:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN')
  }

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = (end - start) / 1000 / 60 // in minutes
    if (diff < 60) return `${Math.round(diff)} mins`
    return `${(diff / 60).toFixed(1)} hours`
  }

  const ratingColors = {
    EXCELLENT: 'bg-green-100 text-green-800',
    GOOD: 'bg-blue-100 text-blue-800',
    SATISFACTORY: 'bg-yellow-100 text-yellow-800',
    NEEDS_IMPROVEMENT: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar userRole="CEO" />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/ceo/reports')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Report Details</h1>
                <p className="text-gray-900 font-semibold mt-1">Complete inspection report with photos and location tracking</p>
              </div>
              <button
                onClick={fetchReportDetails}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {inspection && (
              <div className="space-y-6">
                {/* Report Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* School Info */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapIcon size={20} className="text-blue-600" />
                      School Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">School Name</p>
                        <p className="text-sm font-bold text-gray-900">{inspection.schoolName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">District</p>
                        <p className="text-sm font-bold text-gray-900">{inspection.schoolLocation?.district || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Latitude</p>
                          <p className="text-xs font-mono text-blue-600 font-bold">
                            {inspection.schoolLocation?.latitude?.toFixed(6) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Longitude</p>
                          <p className="text-xs font-mono text-blue-600 font-bold">
                            {inspection.schoolLocation?.longitude?.toFixed(6) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inspector & Plan Info */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Inspector & Plan</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Inspector Name</p>
                        <p className="text-sm font-bold text-gray-900">{inspection.inspectorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Employee ID</p>
                        <p className="text-sm font-mono font-bold text-gray-900">{inspection.inspectorId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Inspection Plan</p>
                        <p className="text-sm font-bold text-gray-900">{inspection.planTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Start Time</p>
                        <p className="text-sm font-bold text-gray-900">{formatTime(inspection.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">End Time</p>
                        <p className="text-sm font-bold text-gray-900">{formatTime(inspection.endTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{formatDuration(inspection.startTime, inspection.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Rating */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Assessment</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Status</p>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold capitalize">
                          {inspection.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Overall Rating</p>
                        <span
                          className={`inline-block px-3 py-1 ${ratingColors[inspection.overallRating] || 'bg-gray-100 text-gray-800'} rounded-full text-sm font-bold`}
                        >
                          {inspection.overallRating || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Submitted</p>
                        <p className="text-sm font-bold text-gray-900">{formatTime(inspection.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Findings and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      Findings
                    </h3>
                    <p className="text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                      {inspection.findings || 'No findings recorded'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle size={20} className="text-orange-600" />
                      Recommendations
                    </h3>
                    <p className="text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                      {inspection.recommendations || 'No recommendations recorded'}
                    </p>
                  </div>
                </div>

                {/* Photos Section */}
                {inspection.photos && inspection.photos.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Camera size={24} className="text-blue-600" />
                      Inspection Photos ({inspection.photos.length})
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Photos Grid */}
                      <div className="lg:col-span-1 space-y-2">
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {inspection.photos.map((photo) => (
                            <button
                              key={photo._id}
                              onClick={() => setSelectedPhoto(photo)}
                              className={`w-full rounded-lg overflow-hidden border-2 transition hover:shadow-lg ${
                                selectedPhoto?._id === photo._id
                                  ? 'border-blue-600 shadow-lg'
                                  : 'border-gray-200 hover:border-blue-400'
                              }`}
                            >
                              <div className="relative bg-gray-100 h-20">
                                <img
                                  src={getPhotoUrl(photo.url)}
                                  alt="Inspection photo"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150x120?text=Photo'
                                  }}
                                />
                              </div>
                              <div className="bg-white p-2">
                                <p className="text-xs font-semibold text-gray-900 truncate">{formatTime(photo.timestamp)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Photo Display */}
                      {selectedPhoto && (
                        <div className="lg:col-span-2 space-y-4">
                          {/* Photo Image */}
                          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
                            <img
                              src={getPhotoUrl(selectedPhoto.url)}
                              alt="Selected photo"
                              className="w-full h-96 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Not+Available'
                              }}
                            />
                          </div>

                          {/* Photo Metadata */}
                          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Photo Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Captured At</p>
                                <p className="text-sm font-bold text-gray-900">{formatTime(selectedPhoto.timestamp)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Filename</p>
                                <p className="text-xs font-mono text-gray-900 truncate">{selectedPhoto.filename}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Latitude</p>
                                <p className="text-xs font-mono text-blue-600 font-bold">
                                  {selectedPhoto.latitude?.toFixed(6) || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Longitude</p>
                                <p className="text-xs font-mono text-blue-600 font-bold">
                                  {selectedPhoto.longitude?.toFixed(6) || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Accuracy</p>
                                <p className="text-xs font-bold text-gray-900">{selectedPhoto.accuracy ? `${selectedPhoto.accuracy}m` : 'N/A'}</p>
                              </div>
                            </div>

                            {/* Map for this photo */}
                            {selectedPhoto.latitude && selectedPhoto.longitude && (
                              <div className="mt-4">
                                <LocationMapCard
                                  title="Photo Location"
                                  latitude={selectedPhoto.latitude}
                                  longitude={selectedPhoto.longitude}
                                  accuracy={selectedPhoto.accuracy}
                                  schoolLocation={inspection.schoolLocation}
                                  schoolName={inspection.schoolName}
                                  height="300px"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Tracking Section */}
                {inspection.locationHistory && inspection.locationHistory.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin size={24} className="text-blue-600" />
                      DEO Location Journey ({inspection.locationHistory.length} points)
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Location List */}
                      <div className="lg:col-span-1 space-y-2">
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {inspection.locationHistory.map((location, index) => (
                            <button
                              key={location._id || index}
                              onClick={() => setSelectedLocation(location)}
                              className={`w-full p-3 rounded-lg text-left border-2 transition ${
                                selectedLocation?.timestamp === location.timestamp
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                  : 'bg-white border-gray-200 hover:border-blue-400 text-gray-900'
                              }`}
                            >
                              <p className="text-xs font-semibold">
                                {selectedLocation?.timestamp === location.timestamp ? 'Point' : 'Point'} {index + 1}
                              </p>
                              <p className="text-xs mt-1">
                                {formatTime(location.timestamp)}
                              </p>
                              {selectedLocation?.timestamp !== location.timestamp && (
                                <p className="text-xs mt-1 text-gray-600">
                                  {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Location Map */}
                      {selectedLocation && (
                        <div className="lg:col-span-3">
                          <LocationMapCard
                            title="DEO Location During Inspection"
                            latitude={selectedLocation.latitude}
                            longitude={selectedLocation.longitude}
                            accuracy={selectedLocation.accuracy}
                            schoolLocation={inspection.schoolLocation}
                            schoolName={inspection.schoolName}
                            height="400px"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty States */}
                {(!inspection.photos || inspection.photos.length === 0) && (!inspection.locationHistory || inspection.locationHistory.length === 0) && (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                    <Image size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No photos or location data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ViewCEOReportDetails
