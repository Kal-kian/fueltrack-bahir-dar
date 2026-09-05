import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import OwnerHeader from '../components/OwnerHeader'
import Footer from '../components/Footer'

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

export default function StationDetails() {
  const { stationId } = useParams()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchStation()
  }, [stationId])

  const fetchStation = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/stations/${stationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStation(res.data)
    } catch (error) {
      console.error('Error fetching station:', error)
      toast.error('Failed to load station details')
      navigate('/owner')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerHeader />
        <div className="text-center py-10">Loading...</div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerHeader />
        <div className="text-center py-10">Station not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OwnerHeader />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/owner')}
            className="text-primary hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">{station.name}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className={`inline-block px-3 py-1 rounded text-sm ${
            station.isApproved 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {station.isApproved ? '✅ Approved' : '⏳ Pending Review'}
          </div>

          <div className="space-y-2">
            <p><span className="font-medium">Location:</span> {station.location}</p>
            <p><span className="font-medium">Contact:</span> {station.contactPhone}</p>
            <p><span className="font-medium">Fuel Types:</span> {station.fuelTypes}</p>
            <p><span className="font-medium">Registered:</span> {new Date(station.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Current Fuel Status</h3>
            <div className="flex gap-6">
              {station.fuelTypes.split(',').map(type => {
                const fuelStatus = station.fuelStatuses?.find(f => f.fuelType === type)
                const status = fuelStatus?.status || 'OUT'
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="font-medium">{type}</span>
                    <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></span>
                    <span>{STATUS_TEXT[status]}</span>
                    {fuelStatus?.updatedAt && (
                      <span className="text-xs text-gray-400">
                        Updated: {new Date(fuelStatus.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t flex gap-4">
            <Link
              to={`/owner/update-status/${station.id}`}
              className={`px-6 py-2 rounded-lg text-white transition ${
                station.isApproved
                  ? 'bg-primary hover:bg-primary-light'
                  : 'bg-gray-400 cursor-not-allowed'
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}