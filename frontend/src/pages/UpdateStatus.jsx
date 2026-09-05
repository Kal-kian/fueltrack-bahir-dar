import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import OwnerHeader from '../components/OwnerHeader'
import Footer from '../components/Footer'

export default function UpdateStatus() {
  const { stationId } = useParams()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState({
    diesel: 'OUT',
    petrol: 'OUT'
  })

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
      
      const dieselStatus = res.data.fuelStatuses?.find(f => f.fuelType === 'DIESEL')
      const petrolStatus = res.data.fuelStatuses?.find(f => f.fuelType === 'PETROL')
      setStatus({
        diesel: dieselStatus?.status || 'OUT',
        petrol: petrolStatus?.status || 'OUT'
      })
    } catch (error) {
      console.error('Error fetching station:', error)
      toast.error('Failed to load station')
      navigate('/owner')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/stations/${stationId}/status`,
        {
          diesel: status.diesel,
          petrol: status.petrol
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Fuel status updated successfully!')
      navigate('/owner')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OwnerHeader />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Update Fuel Status</h1>
        <p className="text-gray-500 text-sm mb-6">
          {station?.name} - {station?.location}
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DIESEL
            </label>
            <div className="flex gap-4">
              {['AVAILABLE', 'LOW', 'OUT'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="diesel"
                    value={option}
                    checked={status.diesel === option}
                    onChange={(e) => setStatus({...status, diesel: e.target.value})}
                    className="text-primary focus:ring-primary"
                  />
                  <span className={`text-sm ${
                    option === 'AVAILABLE' ? 'text-green-600' :
                    option === 'LOW' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PETROL
            </label>
            <div className="flex gap-4">
              {['AVAILABLE', 'LOW', 'OUT'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="petrol"
                    value={option}
                    checked={status.petrol === option}
                    onChange={(e) => setStatus({...status, petrol: e.target.value})}
                    className="text-primary focus:ring-primary"
                  />
                  <span className={`text-sm ${
                    option === 'AVAILABLE' ? 'text-green-600' :
                    option === 'LOW' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/owner')}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}