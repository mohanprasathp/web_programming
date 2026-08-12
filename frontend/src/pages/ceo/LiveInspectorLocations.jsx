import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LocationMap, { LocationMapCard } from '../../components/LocationMap'
import { ceoService } from '../../services/api'
import { MapPin, Users, Clock, AlertCircle, RefreshCw } from 'lucide-react'

const LiveInspectorLocations = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInspector, setSelectedInspector] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch live locations
  const fetchLocations = async () => {
    try {
      setError('')
      const response = await ceoService.getLiveInspectorLocations()
      setLocations(response.data.locations || [])

      if (response.data.locations.length === 0) {
        setError('No active inspections with location tracking')
      } else if (!selectedInspector && response.data.locations.length > 0) {
        // Auto-select first inspector if none selected
        setSelectedInspector(response.data.locations[0])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch live locations')
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  // Auto-refresh locations every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLocations()
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
                <MapPin size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Live Inspector Locations</h1>
                  <p className="text-gray-900 font-semibold mt-1">Monitor real-time locations of inspectors during inspections</p>
                </div>
              </div>
              <button
                onClick={fetchLocations}
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

            {/* Auto-refresh toggle */}
            {locations.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoRefresh" className="text-gray-900 font-semibold cursor-pointer flex-1">
                  Auto-refresh every 10 seconds
                </label>
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                  {locations.length} active inspector{locations.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 text-lg">No active inspections with location tracking</p>
                <p className="text-gray-500 text-sm mt-2">
                  Inspectors must start live tracking during their inspections
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inspector List */}
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">Active Inspectors</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locations.map((location) => (
                      <button
                        key={location.inspectionId}
                        onClick={() => setSelectedInspector(location)}
                        className={`w-full p-4 rounded-lg text-left transition ${
                          selectedInspector?.inspectionId === location.inspectionId
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold">{location.inspectorName}</p>
                            <p className={`text-xs ${selectedInspector?.inspectionId === location.inspectionId ? 'text-blue-100' : 'text-gray-600'}`}>
                              ID: {location.inspectorEmployeeId}
                            </p>
                            <p className={`text-sm ${selectedInspector?.inspectionId === location.inspectionId ? 'text-blue-100' : 'text-gray-600'}`}>
                              {location.schoolName}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                              <Clock size={12} />
                              <span>{formatTime(location.currentLocation.timestamp)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-mono ${
                              selectedInspector?.inspectionId === location.inspectionId ? 'text-blue-100' : 'text-green-600'
                            }`}>
                              {formatDistance(location.distance)}
                            </div>
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mt-1 ml-auto"></div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map and Details */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedInspector ? (
                    <>
                      {/* Map */}
                      <LocationMapCard
                        title={`${selectedInspector.inspectorName} - Live Location`}
                        latitude={selectedInspector.currentLocation.latitude}
                        longitude={selectedInspector.currentLocation.longitude}
                        accuracy={selectedInspector.currentLocation.accuracy}
                        schoolLocation={selectedInspector.schoolLocation}
                        schoolName={selectedInspector.schoolName}
                        height="400px"
                      />

                      {/* Details Card */}
                      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Location Details</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Inspector</p>
                            <p className="text-base font-bold text-gray-900">{selectedInspector.inspectorName}</p>
                            <p className="text-xs text-gray-600">ID: {selectedInspector.inspectorEmployeeId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">School</p>
                            <p className="text-base font-bold text-gray-900">{selectedInspector.schoolName}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Distance from School</p>
                            <p className={`text-2xl font-bold ${
                              parseFloat(selectedInspector.distance) < 100 ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {formatDistance(selectedInspector.distance)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Last Update</p>
                            <p className="text-base font-bold text-gray-900">{formatTime(selectedInspector.currentLocation.timestamp)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Current Latitude</p>
                            <p className="text-base font-mono font-bold text-blue-600">
                              {selectedInspector.currentLocation.latitude.toFixed(6)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Current Longitude</p>
                            <p className="text-base font-mono font-bold text-blue-600">
                              {selectedInspector.currentLocation.longitude.toFixed(6)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 font-semibold">GPS Accuracy</p>
                            <p className="text-base font-bold text-gray-900">
                              ±{(selectedInspector.currentLocation.accuracy || 0).toFixed(2)}m
                            </p>
                          </div>

                          {selectedInspector.schoolLocation.latitude && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">School Location</p>
                              <p className="text-sm font-mono text-gray-700">
                                {selectedInspector.schoolLocation.latitude.toFixed(4)}, {selectedInspector.schoolLocation.longitude.toFixed(4)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="font-semibold text-green-700">Inspector is actively tracking location</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-600 font-semibold">Select an inspector to view details</p>
                      </div>
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

export default LiveInspectorLocations
