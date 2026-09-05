import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'

export default function Favorites() {
  const { user, logout } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(res.data)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (stationId, stationName) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/favorites/${stationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`❌ Removed ${stationName} from favorites`)
      fetchFavorites()
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove favorite')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo size="sm" showText={true} />
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">👋 {user?.name}</span>
            <Link to="/dashboard" className="bg-white/20 px-4 py-1 rounded hover:bg-white/30 transition text-sm">
              ← Back
            </Link>
            <button
              onClick={logout}
              className="bg-white/20 px-4 py-1 rounded hover:bg-white/30 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">⭐ My Favorite Stations</h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow">
            <p className="text-gray-500">You haven't added any favorites yet.</p>
            <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">
              Browse stations and click the ⭐ to add favorites!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(fav => (
              <div key={fav.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{fav.station.name}</h3>
                    <p className="text-gray-500 text-sm">{fav.station.location}</p>
                    <p className="text-gray-500 text-sm">📞 {fav.station.contactPhone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added: {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFavorite(fav.station.id, fav.station.name)}
                    className="text-2xl hover:scale-110 transition"
                  >
                    ⭐
                  </button>
                </div>
                <Link
                  to={`/dashboard?station=${fav.station.id}`}
                  className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light transition"
                >
                  View Station
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}