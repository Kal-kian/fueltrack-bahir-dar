import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Footer from '../components/Footer'
import OwnerHeader from '../components/OwnerHeader'

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

export default function OwnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/stations/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStations(res.data)
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

  const approvedCount = stations.filter(s => s.isApproved).length
  const pendingCount = stations.filter(s => !s.isApproved).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ Header */}
      <OwnerHeader />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Stations</h1>
            <p className="text-gray-500 text-sm">{stations.length} registered stations</p>
          </div>
          <Link
            to="/owner/add-station"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition"
          >
            + Add New Station
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow px-6 py-4">
            <div className="text-2xl font-bold text-primary">{stations.length}</div>
            <div className="text-sm text-gray-500">Total Stations</div>
          </div>
          <div className="bg-white rounded-lg shadow px-6 py-4">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow px-6 py-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : stations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">You haven't registered any stations yet.</p>
            <Link to="/owner/add-station" className="text-primary hover:underline mt-2 inline-block">
              Register your first station
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stations.map(station => (
              <div key={station.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-primary">{station.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        station.isApproved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {station.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{station.location}</p>
                    <p className="text-gray-600 text-sm">📞 {station.contactPhone}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    <Link
                      to={`/owner/update-status/${station.id}`}
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        station.isApproved
                          ? 'bg-primary text-white hover:bg-primary-light'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        if (!station.isApproved) {
                          e.preventDefault()
                          toast.error('Station must be approved before updating status')
                        }
                      }}
                    >
                      Update Status
                    </Link>
                    <Link
                      to={`/owner/station/${station.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex flex-wrap gap-6">
                  {station.fuelTypes.split(',').map(type => {
                    const status = getFuelStatus(station, type)
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="font-medium text-sm">{type}</span>
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}></span>
                        <span className="text-sm text-gray-600">{STATUS_TEXT[status]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}