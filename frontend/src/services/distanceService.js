import { between, nearSort } from '@simoko/geo-distance'

// Get user's current location using browser geolocation
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        // Fallback to Bahir Dar city center
        resolve({ lat: 11.5742, lng: 37.3613 })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// Calculate distance between two points in kilometers
export const calculateDistance = (point1, point2) => {
  try {
    const distance = between(point1, point2, 'km')
    return Math.round(distance * 10) / 10 // Round to 1 decimal
  } catch (error) {
    console.error('Distance calculation error:', error)
    return null
  }
}

// Estimate drive time in minutes (assuming average speed of 30 km/h in city)
export const estimateDriveTime = (distanceKm) => {
  if (!distanceKm || distanceKm < 0) return 'N/A'
  const avgSpeed = 30 // km/h in city
  const timeHours = distanceKm / avgSpeed
  const timeMinutes = Math.round(timeHours * 60)
  return timeMinutes
}

// Estimate walk time in minutes (assuming average speed of 5 km/h)
export const estimateWalkTime = (distanceKm) => {
  if (!distanceKm || distanceKm < 0) return 'N/A'
  const avgSpeed = 5 // km/h walking
  const timeHours = distanceKm / avgSpeed
  const timeMinutes = Math.round(timeHours * 60)
  return timeMinutes
}

// Format distance for display
export const formatDistance = (distanceKm) => {
  if (!distanceKm) return 'N/A'
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm} km`
}

// Get station coordinates (you'll need to add these to your database)
// For now, we'll use mock coordinates around Bahir Dar
export const getStationCoordinates = (stationName) => {
  // These are mock coordinates - in production, store lat/lng in your database
  const baseLat = 11.5742
  const baseLng = 37.3613
  
  // Generate deterministic but unique coordinates based on station name
  const hash = stationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const latOffset = (hash % 100) / 10000
  const lngOffset = ((hash * 7) % 100) / 10000
  
  return {
    lat: baseLat + latOffset * (hash % 2 === 0 ? 1 : -1),
    lng: baseLng + lngOffset * (hash % 3 === 0 ? 1 : -1)
  }
}

// Add distance info to a station
export const addDistanceToStation = (station, userLocation) => {
  const stationCoords = getStationCoordinates(station.name)
  const distanceKm = calculateDistance(userLocation, stationCoords)
  
  return {
    ...station,
    coordinates: stationCoords,
    distance: {
      km: distanceKm,
      driveMinutes: estimateDriveTime(distanceKm),
      walkMinutes: estimateWalkTime(distanceKm),
      formatted: formatDistance(distanceKm)
    }
  }
}

// Sort stations by distance (closest first)
export const sortByDistance = (stations, userLocation) => {
  return [...stations].sort((a, b) => {
    const distA = a.distance?.km || 9999
    const distB = b.distance?.km || 9999
    return distA - distB
  })
}

// Sort stations by fuel availability
export const sortByAvailability = (stations) => {
  return [...stations].sort((a, b) => {
    const aAvailable = a.fuelStatuses?.filter(f => f.status === 'AVAILABLE').length || 0
    const bAvailable = b.fuelStatuses?.filter(f => f.status === 'AVAILABLE').length || 0
    return bAvailable - aAvailable
  })
}