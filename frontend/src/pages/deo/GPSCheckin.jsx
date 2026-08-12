import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LocationMap, { LocationMapCard } from '../../components/LocationMap'
import { MapPin, Navigation, AlertCircle } from 'lucide-react'

const GPSCheckin = () => {
  const [location, setLocation] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [watchId, setWatchId] = useState(null)
  const navigate = useNavigate()

  const getLocation = () => {
    setLoading(true)
    setError('')
    setSuccess('')

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
        setSuccess(`GPS Location acquired: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setLoading(false)
      },
      (error) => {
        setError(`Error getting location: ${error.message}`)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const startLiveTracking = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setLocation({ latitude, longitude })
        setAccuracy(acc)
        setSuccess(`Live tracking: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setLoading(false)
      },
      (error) => {
        setError(`Error tracking location: ${error.message}`)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )

    setWatchId(id)
  }

  const stopLiveTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setSuccess('Live tracking stopped')
    }
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <MapPin size={32} className="text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-surface-950">GPS Location Check-in</h1>
                <p className="text-surface-600 mt-1">Verify your location before starting inspection</p>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <MapPin size={20} className="flex-shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Location Info Card */}
              <div className="lg:col-span-1 space-y-4">
                {/* Location Details */}
                <div className="bg-white rounded-lg border border-surface-200 shadow-md p-6">
                  <h2 className="font-bold text-lg text-surface-950 mb-4 flex items-center gap-2">
                    <Navigation size={20} />
                    Current Location
                  </h2>

                  {location ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-surface-950 font-semibold mb-1">Latitude</p>
                        <p className="text-xl font-mono font-bold text-blue-600">
                          {location.latitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-surface-950 font-semibold mb-1">Longitude</p>
                        <p className="text-xl font-mono font-bold text-blue-600">
                          {location.longitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-surface-950 font-semibold mb-1">Accuracy</p>
                        <p className="text-xl font-bold text-green-600">
                          ±{accuracy.toFixed(2)} meters
                        </p>
                      </div>

                      <div className="text-sm text-surface-500 bg-surface-50 rounded p-3">
                        <p className="font-medium mb-1">Timestamp:</p>
                        <p className="font-mono text-xs">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MapPin size={32} className="mx-auto text-surface-300 mb-2" />
                      <p className="text-surface-600">No location acquired yet</p>
                      <p className="text-sm text-surface-500 mt-2">
                        Click a button below to get your location
                      </p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={getLocation}
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Navigation size={18} />
                    {loading ? 'Getting Location...' : 'Get GPS Location'}
                  </button>

                  {watchId === null ? (
                    <button
                      onClick={startLiveTracking}
                      disabled={loading}
                      className="w-full px-6 py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} />
                      Start Live Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopLiveTracking}
                      className="w-full px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} />
                      Stop Live Tracking
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/deo')}
                    className="w-full px-6 py-3 rounded-lg font-bold text-surface-700 bg-surface-200 hover:bg-surface-300 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {/* Requirements */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} />
                    GPS Requirements
                  </h3>
                  <ul className="text-yellow-700 text-sm space-y-2">
                    <li>✓ Location services enabled</li>
                    <li>✓ Browser permission granted</li>
                    <li>✓ GPS accuracy &lt; 100m</li>
                    <li>✓ Check in at school</li>
                  </ul>
                </div>
              </div>

              {/* Map Section */}
              <div className="lg:col-span-2">
                {location ? (
                  <LocationMapCard
                    title="Your Location on Map"
                    latitude={location.latitude}
                    longitude={location.longitude}
                    accuracy={accuracy}
                    height="500px"
                  />
                ) : (
                  <div className="bg-white rounded-lg border border-surface-200 shadow-md h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-surface-300 mb-3" />
                      <p className="text-surface-600 font-medium">
                        Get your location to see the map
                      </p>
                      <p className="text-sm text-surface-500 mt-1">
                        Maps will appear here once you acquire GPS location
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default GPSCheckin
