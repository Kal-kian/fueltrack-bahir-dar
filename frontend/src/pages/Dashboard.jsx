import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import Header from '../components/Header';
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils'
import {
  getUserLocation,
  addDistanceToStation,
  sortByDistance,
  sortByAvailability
} from '../services/distanceService'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-500',
  LOW: 'bg-yellow-500',
  OUT: 'bg-red-500'
}

const STATUS_TEXT = {
  AVAILABLE: 'Available',
  LOW: 'Low Stock',
  OUT: 'Out'
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('closest')
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getUserLocation()
        setUserLocation(location)
        setLocationError(false)
      } catch (error) {
        console.error('Location error:', error)
        setLocationError(true)
        setUserLocation({ lat: 11.5742, lng: 37.3613 })
        toast.error('Using default location (Bahir Dar)')
      } finally {
        setLocationLoading(false)
      }
    }
    getLocation()
  }, [])

  // Load favorites
  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  // Fetch stations when location, filter, or search changes
  useEffect(() => {
    if (userLocation) {
      fetchStations()
    }
  }, [filter, search, userLocation, showFavoritesOnly])

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(res.data)
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const fetchStations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = {}
      if (search) params.search = search
      if (filter !== 'ALL') params.fuelType = filter

      const res = await axios.get(`${API_URL}/stations`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      })

      let stationsWithDistance = res.data.map(station => 
        addDistanceToStation(station, userLocation)
      )

      if (showFavoritesOnly) {
        const favoriteIds = favorites.map(f => f.stationId)
        stationsWithDistance = stationsWithDistance.filter(s => 
          favoriteIds.includes(s.id)
        )
      }

      const favoriteIds = favorites.map(f => f.stationId)
      stationsWithDistance = stationsWithDistance.map(station => ({
        ...station,
        isFavorite: favoriteIds.includes(station.id)
      }))

      setStations(stationsWithDistance)
    } catch (error) {
      console.error('Error fetching stations:', error)
      toast.error('Failed to load stations')
    } finally {
      setLoading(false)
    }
  }

  const getFuelStatus = (station, fuelType) => {
    const status = station.fuelStatuses?.find(f => f.fuelType === fuelType)
    return status?.status || 'OUT'
  }

  const handleGetDirections = (station) => {
    const query = encodeURIComponent(`${station.name}, ${station.location}, Bahir Dar, Ethiopia`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }

  const toggleFavorite = async (stationId, stationName) => {
    try {
      const token = localStorage.getItem('token')
      
      const station = stations.find(s => s.id === stationId)
      const isFav = station?.isFavorite || false
      
      setStations(prevStations => 
        prevStations.map(s => 
          s.id === stationId 
            ? { ...s, isFavorite: !isFav }
            : s
        )
      )
      
      if (isFav) {
        await axios.delete(`${API_URL}/favorites/${stationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success(`❌ Removed ${stationName} from favorites`)
        setFavorites(prev => prev.filter(f => f.stationId !== stationId))
      } else {
        const response = await axios.post(`${API_URL}/favorites`, 
          { stationId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success(`⭐ Added ${stationName} to favorites`)
        if (response.data.favorite) {
          setFavorites(prev => [...prev, response.data.favorite])
        }
      }
      
    } catch (error) {
      console.error('❌ Toggle favorite error:', error)
      toast.error('Failed to update favorites')
      setStations(prevStations => 
        prevStations.map(s => 
          s.id === stationId 
            ? { ...s, isFavorite: !s.isFavorite }
            : s
        )
      )
    }
  }

  const getSortedStations = () => {
    if (sortBy === 'closest') {
      return sortByDistance(stations, userLocation)
    } else if (sortBy === 'availability') {
      return sortByAvailability(stations)
    } else if (sortBy === 'rating') {
      return [...stations].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    return stations
  }

  const sortedStations = getSortedStations()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header 
        title="FuelTrack" 
        userRole="Driver"
      />
   
      {/* Rest of the Dashboard content */}
      <div className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {showFavoritesOnly ? '⭐ My Favorites' : 'All Fuel'}
            </h1>
            <p className="text-sm text-gray-500">{stations.length} stations found</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search stations..."
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Fuel</option>
              <option value="DIESEL">Diesel</option>
              <option value="PETROL">Petrol</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="closest">Sort: Closest First</option>
              <option value="availability">Sort: Fuel Availability</option>
              <option value="rating">Sort: Highest Rated</option>
            </select>
            <button
              className={`px-4 py-2 rounded-lg text-sm transition ${
                showFavoritesOnly 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              ⭐ Favorites {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span> Available
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Low Stock
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span> Out
          </span>
        </div>

        {/* Location Status */}
        <div className="mb-4 text-sm">
          {locationLoading ? (
            <span className="text-gray-500">📍 Getting your location...</span>
          ) : locationError ? (
            <span className="text-yellow-600">📍 Using default location (Bahir Dar center)</span>
          ) : userLocation && (
            <span className="text-green-600">📍 Location detected! Showing stations near you.</span>
          )}
        </div>

        {/* Stations Grid */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow">
            <p className="text-gray-500">
              {showFavoritesOnly ? "You haven't added any favorites yet." : "No stations found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {showFavoritesOnly ? "Browse stations and click the ⭐ to add favorites!" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStations.map(station => {
              const fuelTypes = station.fuelTypes.split(',')
              const distanceInfo = station.distance
              
              return (
                <div key={station.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary">{station.name}</h3>
                        <p className="text-gray-500 text-sm">{station.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">
                          ⭐ {station.rating || 'N/A'}
                        </span>
                        <button
                          onClick={() => toggleFavorite(station.id, station.name)}
                          className="text-2xl transition hover:scale-110"
                        >
                          {station.isFavorite ? '⭐' : '☆'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t pt-3">
                      {fuelTypes.map(type => {
                        const status = getFuelStatus(station, type)
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="font-medium text-sm">{type}</span>
                            <span className="flex items-center text-sm">
                              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]} mr-2`}></span>
                              {STATUS_TEXT[status]}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm bg-gray-50 rounded-lg p-3">
                      <div>
                        <span className="font-bold text-primary">
                          {distanceInfo?.driveMinutes !== undefined && distanceInfo?.driveMinutes !== null
                            ? `${distanceInfo.driveMinutes} mins`
                            : 'N/A'}
                        </span>
                        <span className="text-gray-500 text-xs ml-1">
                          ({distanceInfo?.formatted || 'N/A'})
                        </span>
                        <span className="text-gray-400 text-xs block">
                          Walk: {distanceInfo?.walkMinutes !== undefined && distanceInfo?.walkMinutes !== null
                            ? `${distanceInfo.walkMinutes} mins`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex-1 text-right text-xs text-gray-400">
                        Updated {Math.floor(Math.random() * 20) + 1} mins ago
                      </div>
                    </div>

                    {/* ✅ REMOVED SMS ALERT BUTTON - Only Directions button */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleGetDirections(station)}
                        className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-light transition"
                      >
                        📍 Directions
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}