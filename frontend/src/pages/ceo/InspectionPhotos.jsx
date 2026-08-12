import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LocationMap, { LocationMapCard } from '../../components/LocationMap'
import { ceoService } from '../../services/api'
import { Image, MapPin, Clock, AlertCircle, RefreshCw, Camera } from 'lucide-react'

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

const InspectionPhotos = () => {
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await ceoService.getAllInspectionsWithPhotos()
      setInspections(response.data.inspections || [])

      if (response.data.inspections.length === 0) {
        setError('No inspections with photos found')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inspections')
      console.error('Error fetching inspections:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async (inspectionId) => {
    try {
      setLoadingPhotos(true)
      setError('')
      const response = await ceoService.getInspectionPhotos(inspectionId)
      setPhotos(response.data.photos || [])
      setSelectedInspection(response.data.inspection)
      setSelectedPhoto(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch photos')
      console.error('Error fetching photos:', err)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleSelectInspection = async (inspection) => {
    await fetchPhotos(inspection._id)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN')
  }

  const formatDistance = (meters) => {
    if (!meters) return 'N/A'
    if (meters < 1000) return `${meters}m`
    return `${(meters / 1000).toFixed(2)}km`
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Inspection Photos</h1>
                  <p className="text-gray-900 font-semibold mt-1">View photos uploaded by DEO officers during inspections</p>
                </div>
              </div>
              <button
                onClick={fetchInspections}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                <Camera size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 text-lg font-semibold">No inspection photos found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Photos will appear here once DEO officers upload them during inspections
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Inspections List */}
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">Inspections ({inspections.length})</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inspections.map((inspection) => (
                      <button
                        key={inspection._id}
                        onClick={() => handleSelectInspection(inspection)}
                        className={`w-full p-4 rounded-lg text-left transition ${
                          selectedInspection?._id === inspection._id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-900'
                        }`}
                      >
                        <div className="font-bold text-sm">{inspection.schoolName}</div>
                        <p className={`text-xs ${selectedInspection?._id === inspection._id ? 'text-blue-100' : 'text-gray-600'}`}>
                          Inspector: {inspection.inspectorName}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Image size={12} />
                          <span>{inspection.photoCount} photos</span>
                        </div>
                        <div className="text-xs mt-1">
                          <Clock size={12} className="inline mr-1" />
                          {formatTime(inspection.lastPhotoTime)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photos Display */}
                <div className="lg:col-span-3 space-y-6">
                  {selectedInspection ? (
                    <>
                      {/* Inspection Info */}
                      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Inspection Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">School</p>
                            <p className="text-sm font-bold text-gray-900">{selectedInspection.schoolName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Inspector</p>
                            <p className="text-sm font-bold text-gray-900">{selectedInspection.inspectorName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Status</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{selectedInspection.status}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Total Photos</p>
                            <p className="text-sm font-bold text-gray-900">{photos.length}</p>
                          </div>
                        </div>
                      </div>

                      {loadingPhotos ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : photos.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border-2 border-gray-200">
                          <Camera size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-600 font-semibold">No photos uploaded yet</p>
                        </div>
                      ) : (
                        <>
                          {/* Selected Photo Display */}
                          {selectedPhoto && (
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
                                <div className="flex items-center gap-3">
                                  <Camera size={20} className="text-blue-600" />
                                  <h3 className="text-lg font-bold text-gray-900">Selected Photo Details</h3>
                                </div>

                                <div className="mt-4 space-y-4">
                                  {/* Photo Image */}
                                  <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                      src={getPhotoUrl(selectedPhoto.url)}
                                      alt="Inspection"
                                      className="w-full h-96 object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Not+Available'
                                      }}
                                    />
                                  </div>

                                  {/* Photo Metadata */}
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
                                  </div>

                                  {/* Map Display */}
                                  {selectedPhoto.latitude && selectedPhoto.longitude && (
                                    <LocationMapCard
                                      title="Photo Location"
                                      latitude={selectedPhoto.latitude}
                                      longitude={selectedPhoto.longitude}
                                      accuracy={selectedPhoto.accuracy}
                                      schoolLocation={selectedInspection.schoolLocation}
                                      schoolName={selectedInspection.schoolName}
                                      height="300px"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Photos Grid */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Image size={20} />
                              All Photos ({photos.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {photos.map((photo) => (
                                <button
                                  key={photo._id}
                                  onClick={() => setSelectedPhoto(photo)}
                                  className={`rounded-lg overflow-hidden border-2 transition hover:shadow-lg ${
                                    selectedPhoto?._id === photo._id
                                      ? 'border-blue-600 shadow-lg'
                                      : 'border-gray-200 hover:border-blue-400'
                                  }`}
                                >
                                  <div className="relative bg-gray-100 h-32">
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
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                      {formatTime(photo.timestamp)}
                                    </p>
                                    <p className="text-xs text-gray-600">{photo.filename}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                      <Camera size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-600 font-semibold">Select an inspection to view photos</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default InspectionPhotos
