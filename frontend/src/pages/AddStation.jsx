import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import OwnerHeader from '../components/OwnerHeader'
import Footer from '../components/Footer'

export default function AddStation() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactPhone: '',
    fuelTypes: [],
    notes: ''
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.fuelTypes.length === 0) {
      toast.error('Please select at least one fuel type')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const payload = {
        name: formData.name,
        location: formData.location,
        contactPhone: formData.contactPhone,
        fuelTypes: formData.fuelTypes,
      }

      await axios.post(
        `${API_URL}/stations`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Station registered! Awaiting admin approval.')
      navigate('/owner')
    } catch (error) {
      console.error('Error registering station:', error)
      toast.error(error.response?.data?.error || 'Failed to register station')
    } finally {
      setLoading(false)
    }
  }

  const toggleFuelType = (type) => {
    setFormData(prev => ({
      ...prev,
      fuelTypes: prev.fuelTypes.includes(type)
        ? prev.fuelTypes.filter(t => t !== type)
        : [...prev.fuelTypes, type]
    }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OwnerHeader />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Register New Station</h1>
        <p className="text-gray-500 text-sm mb-6">Fill in your station details</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {/* Station Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              STATION NAME *
            </label>
            <input
              type="text"
              placeholder="e.g., Total Station — Bahir Dar"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LOCATION / ADDRESS *
            </label>
            <input
              type="text"
              placeholder="e.g., Near Bahir Dar Stadium, Main Road"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CONTACT PHONE *
            </label>
            <input
              type="tel"
              placeholder="e.g., 0912345678"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              required
            />
          </div>

          {/* Fuel Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FUEL TYPES OFFERED *
            </label>
            <div className="flex gap-6">
              {['DIESEL', 'PETROL'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fuelTypes.includes(type)}
                    onChange={() => toggleFuelType(type)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
            {formData.fuelTypes.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please select at least one fuel type</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || formData.fuelTypes.length === 0}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Station'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  )
}