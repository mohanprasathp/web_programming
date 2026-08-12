import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Crosshair, AlertCircle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to center map when location changes
const MapRecenter = ({ lat, lng }) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15)
    }
  }, [lat, lng, map])
  return null
}

const LocationMap = ({
  latitude,
  longitude,
  accuracy = null,
  schoolLocation = null,
  schoolName = null,
  inspectionRadius = 100,
}) => {
  const defaultCenter = [12.9716, 77.5946] // Default to Bangalore
  const centerLat = latitude || defaultCenter[0]
  const centerLng = longitude || defaultCenter[1]

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-surface-200 shadow-lg">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Recenter map when location updates */}
        <MapRecenter lat={centerLat} lng={centerLng} />

        {/* Your Current Location */}
        {latitude && longitude && (
          <>
            {/* Accuracy Circle */}
            {accuracy && (
              <Circle
                center={[latitude, longitude]}
                radius={accuracy}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.3,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                }}
              />
            )}

            {/* Current Location Marker */}
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="p-3">
                  <p className="font-semibold text-surface-950 mb-2">Your Current Location</p>
                  <p className="text-sm text-surface-600">
                    Latitude: {latitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-surface-600">
                    Longitude: {longitude.toFixed(6)}
                  </p>
                  {accuracy && (
                    <p className="text-sm text-surface-500 mt-2">
                      Accuracy: ±{accuracy.toFixed(0)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* School Location */}
        {schoolLocation && schoolLocation.latitude && schoolLocation.longitude && (
          <>
            {/* Inspection Radius Circle */}
            <Circle
              center={[schoolLocation.latitude, schoolLocation.longitude]}
              radius={inspectionRadius}
              pathOptions={{
                color: '#ef4444',
                weight: 2,
                opacity: 0.5,
                fillColor: '#ef4444',
                fillOpacity: 0.1,
                dashArray: '5, 5',
              }}
            />

            {/* School Location Marker */}
            <Marker
              position={[schoolLocation.latitude, schoolLocation.longitude]}
              icon={L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <div className="p-3">
                  <p className="font-semibold text-surface-950 mb-2">
                    {schoolName || 'School Location'}
                  </p>
                  <p className="text-sm text-surface-600">
                    Latitude: {schoolLocation.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-surface-600">
                    Longitude: {schoolLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-surface-500 mt-2">
                    Inspection Radius: {inspectionRadius}m
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default LocationMap

export const LocationMapCard = ({
  title = 'Location Map',
  latitude,
  longitude,
  accuracy,
  schoolLocation,
  schoolName,
  inspectionRadius = 100,
  height = '400px',
}) => {
  return (
    <div className="bg-white rounded-lg border border-surface-200 shadow-md overflow-hidden">
      <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center gap-2">
        <MapPin size={20} className="text-blue-600" />
        <h3 className="font-semibold text-surface-950">{title}</h3>
      </div>
      <div style={{ height }}>
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          accuracy={accuracy}
          schoolLocation={schoolLocation}
          schoolName={schoolName}
          inspectionRadius={inspectionRadius}
        />
      </div>
    </div>
  )
}
