import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LocationMap, { LocationMapCard } from '../../components/LocationMap'
import { deoService } from '../../services/api'
import { MapPin, Navigation, RefreshCw, AlertCircle, Eye } from 'lucide-react'

const LocationTracking = () => {
  const [location, setLocation] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState(null)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [inspections, setInspections] = useState([])
  const [loadingInspections, setLoadingInspections] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInspections()
    // Get initial location
    getLocation()
  }, [])

  const fetchInspections = async () => {
    try {
      setLoadingInspections(true)
      const response = await deoService.getInspections()
      setInspections(response.data || [])
    } catch (err) {
      console.error('Error fetching inspections:', err)
    } finally {
      setLoadingInspections(false)
    }
  }

  const getLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setLocation({ latitude, longitude })
        setAccuracy(acc)
        setLoading(false)
      },
      (error) => {
        setError(`Error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const startTracking = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      setLoading(false)
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setLocation({ latitude, longitude })
        setAccuracy(acc)
        setLoading(false)

        // Send location update to backend if inspection is selected
        if (selectedInspection) {
          sendLocationToBackend(selectedInspection, latitude, longitude, acc)
        }
      },
      (error) => {
        setError(`Error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    setWatchId(id)
    setTracking(true)
  }

  const sendLocationToBackend = async (inspectionId, latitude, longitude, accuracy) => {
    try {
      await deoService.updateLocation({
        inspectionId,
        latitude,
        longitude,
        accuracy,
      })
    } catch (err) {
      console.error('Error updating location on backend:', err)
    }
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setTracking(false)
    }
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const currentInspection = selectedInspection
    ? inspections.find((i) => i._id === selectedInspection)
    : null

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-surface-950">Location Tracking</h1>
                  <p className="text-surface-600 mt-1">Track your location in real-time during inspections</p>
                </div>
              </div>
              <button
                onClick={getLocation}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Update Location
              </button>
            </div>

            {/* Errors */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Location Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {tracking && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="font-medium">Live tracking active</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Control Panel */}
              <div className="lg:col-span-1 space-y-4">
                {/* Location Info */}
                <div className="bg-white rounded-lg border border-surface-200 shadow-md p-6">
                  <h2 className="font-bold text-lg text-surface-950 mb-4 flex items-center gap-2">
                    <Navigation size={20} />
                    Current Position
                  </h2>

                  {location ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-surface-500 mb-1">Latitude</p>
                        <p className="text-lg font-mono font-bold text-surface-950">
                          {location.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 mb-1">Longitude</p>
                        <p className="text-lg font-mono font-bold text-surface-950">
                          {location.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded p-3 border border-green-200">
                        <p className="text-xs text-surface-500 mb-1">Accuracy</p>
                        <p className="text-xl font-bold text-green-600">
                          ±{accuracy ? accuracy.toFixed(1) : 0}m
                        </p>
                      </div>
                      <p className="text-xs text-surface-500 bg-surface-50 rounded p-2">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <MapPin size={28} className="mx-auto text-surface-300 mb-2" />
                      <p className="text-sm text-surface-600">
                        Click "Update Location" to get position
                      </p>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="space-y-2">
                  {!tracking ? (
                    <button
                      onClick={startTracking}
                      className="w-full px-4 py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} />
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopTracking}
                      className="w-full px-4 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} />
                      Stop Tracking
                    </button>
                  )}
                </div>

                {/* Inspection Selector */}
                <div className="bg-white rounded-lg border border-surface-200 shadow-md p-6">
                  <h3 className="font-bold text-surface-950 mb-3 flex items-center gap-2">
                    <Eye size={18} />
                    Assigned Inspections
                  </h3>

                  {loadingInspections ? (
                    <p className="text-sm text-surface-600 text-center py-3">Loading...</p>
                  ) : inspections.length === 0 ? (
                    <p className="text-sm text-surface-600 text-center py-3">
                      No inspections assigned
                    </p>
                  ) : (
                    <select
                      value={selectedInspection || ''}
                      onChange={(e) => setSelectedInspection(e.target.value || null)}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Inspection</option>
                      {inspections.map((insp) => (
                        <option key={insp._id} value={insp._id}>
                          {insp.school?.name || 'School'} ({insp.status})
                        </option>
                      ))}
                    </select>
                  )}

                  {currentInspection && (
                    <div className="mt-4 pt-4 border-t border-surface-200 text-sm space-y-2">
                      <p>
                        <span className="text-surface-600">School:</span>
                        <span className="block font-medium text-surface-950">
                          {currentInspection.school?.name || 'N/A'}
                        </span>
                      </p>
                      <p>
                        <span className="text-surface-600">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            currentInspection.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {currentInspection.status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className={`p-4 rounded-lg border ${
                  tracking
                    ? 'bg-green-50 border-green-200'
                    : 'bg-surface-50 border-surface-200'
                }`}>
                  <p className="text-sm font-medium text-surface-950">
                    Tracking Status
                  </p>
                  <p className={`text-lg font-bold mt-2 ${
                    tracking ? 'text-green-600' : 'text-surface-600'
                  }`}>
                    {tracking ? '🔴 Live' : '⚪ Inactive'}
                  </p>
                </div>
              </div>

              {/* Map Section */}
              <div className="lg:col-span-3">
                {location ? (
                  <LocationMapCard
                    title={`Location Map ${tracking ? '(Live)' : '(Last Update)'}`}
                    latitude={location.latitude}
                    longitude={location.longitude}
                    accuracy={accuracy}
                    schoolLocation={
                      currentInspection?.school?.location
                        ? {
                            latitude: currentInspection.school.location.coordinates?.[1],
                            longitude: currentInspection.school.location.coordinates?.[0],
                          }
                        : null
                    }
                    schoolName={currentInspection?.school?.name}
                    inspectionRadius={100}
                    height="600px"
                  />
                ) : (
                  <div className="bg-white rounded-lg border border-surface-200 shadow-md h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-surface-300 mb-3" />
                      <p className="text-surface-600 font-medium">
                        Location map will appear here
                      </p>
                      <p className="text-sm text-surface-500 mt-2">
                        Click "Update Location" button to get your GPS position
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationTracking
