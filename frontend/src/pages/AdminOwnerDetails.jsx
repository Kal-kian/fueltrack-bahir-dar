import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils'

export default function AdminOwnerDetails() {
  const { userId } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [fullScreenImage, setFullScreenImage] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchOwnerDetails()
  }, [userId])

  const fetchOwnerDetails = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/admin/owner/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOwner(res.data)
    } catch (error) {
      console.error('Error fetching owner details:', error)
      toast.error('Failed to load owner details')
      navigate('/admin/manage')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (decision) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/admin/verify/${userId}`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Owner ${decision.toLowerCase()} successfully`)
      fetchOwnerDetails()
    } catch (error) {
      toast.error('Failed to update verification status')
    }
  }

  const handleToggleActive = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/admin/users/${userId}/toggle-active`,
        { isActive: !owner.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Owner ${owner.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchOwnerDetails()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleViewDocument = (docType, docData) => {
    setSelectedDocument({ type: docType, data: docData })
    setShowDocumentModal(true)
  }

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status || 'N/A'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading...</div>
          <div className="text-gray-500">Fetching owner details...</div>
        </div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Owner not found</h2>
          <Link to="/admin/manage" className="text-primary hover:underline mt-4 inline-block">
            Back to Management
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo size="sm" showText={true} textColor="text-white" textSize="text-xl" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">ADMIN</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin/manage" 
              className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition text-sm"
            >
              ← Back to Management
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-sm hover:text-gray-200 transition text-white"
              >
                <span>{user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                     Profile & Settings
                  </Link>
                  <button onClick={() => { setShowDropdown(false); logout(); navigate('/login'); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                   Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
<div className="bg-white rounded-xl shadow-md p-6 mb-6">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

<div className="flex items-center gap-4">
  {/* ✅ Profile Picture */}
  {owner.profileImage ? (
    <img 
      src={getImageSrc(owner.profileImage)}
      alt={owner.name}
      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
      onError={(e) => {
        e.target.style.display = 'none'
        e.target.nextSibling.style.display = 'flex'
      }}
    />
  ) : null}
  <div 
    className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold"
    style={{ display: owner.profileImage ? 'none' : 'flex' }}
  >
    {getAvatarLetter(owner.name)}
  </div>
  <div>
    <h1 className="text-2xl font-bold text-primary">{owner.name}</h1>
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <span className="text-sm text-gray-600">📧 {owner.email}</span>
      <span className="text-sm text-gray-600">📞 {owner.phone}</span>
      <span className="text-sm text-gray-500">ID: #{owner.id}</span>
    </div>
  </div>
</div>
    
            <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                owner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {owner.isActive ? 'Active' : 'Inactive'}
              </span>
              {getStatusBadge(owner.verificationStatus)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {owner.verificationStatus === 'PENDING' && (
              <>
                <button
                  onClick={() => handleVerify('APPROVED')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleVerify('REJECTED')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  ❌ Reject
                </button>
              </>
            )}
            <button
              onClick={handleToggleActive}
              className={`px-6 py-2 rounded-lg transition ${
                owner.isActive 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {owner.isActive ? 'Deactivate' : 'Activate'}
            </button>
           
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['info', 'stations', 'documents', 'activity'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-lg transition ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium text-gray-500">Full Name:</span> {owner.name}</div>
                  <div><span className="font-medium text-gray-500">Email:</span> {owner.email}</div>
                  <div><span className="font-medium text-gray-500">Phone:</span> {owner.phone}</div>
                  <div><span className="font-medium text-gray-500">Role:</span> {owner.role}</div>
                  <div><span className="font-medium text-gray-500">Member Since:</span> {new Date(owner.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-medium text-gray-500">Verified At:</span> {owner.verifiedAt ? new Date(owner.verifiedAt).toLocaleDateString() : 'Not verified'}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{owner._count?.stations || 0}</div>
                    <div className="text-sm text-gray-500">Total Stations</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{owner._count?.subscriptions || 0}</div>
                    <div className="text-sm text-gray-500">Active Subscriptions</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{owner._count?.favorites || 0}</div>
                    <div className="text-sm text-gray-500">Favorites</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{owner.stations?.filter(s => s.isApproved).length || 0}</div>
                    <div className="text-sm text-gray-500">Approved Stations</div>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Verification Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    {getStatusBadge(owner.verificationStatus)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Verified:</span>
                    <span className={`px-2 py-1 rounded text-xs ${owner.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {owner.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {owner.rejectionReason && (
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-500">Rejection Reason:</span>
                      <p className="text-red-600 mt-1">{owner.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stations Tab */}
          {activeTab === 'stations' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Station Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fuel Types</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fuel Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owner.stations?.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                          No stations registered
                        </td>
                      </tr>
                    ) : (
                      owner.stations?.map((station) => (
                        <tr key={station.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium">{station.name}</td>
                          <td className="px-6 py-3 text-sm">{station.location}</td>
                          <td className="px-6 py-3 text-sm">{station.fuelTypes}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              station.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {station.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-wrap gap-1">
                              {station.fuelStatuses?.map((fs) => (
                                <span key={fs.id} className={`px-2 py-1 rounded text-xs ${
                                  fs.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                  fs.status === 'LOW' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {fs.fuelType}: {fs.status}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Link
                              to={`/admin/station/${station.id}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {owner.businessLicense && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-medium text-gray-700 mb-2">📄 Business License</h3>
                  <div className="mt-2">
                    <img 
                      src={`data:image/png;base64,${owner.businessLicense}`}
                      alt="Business License"
                      className="w-full max-h-48 object-contain border rounded cursor-pointer"
                      onClick={() => handleViewDocument('Business License', owner.businessLicense)}
                    />
                    <button
                      onClick={() => handleViewDocument('Business License', owner.businessLicense)}
                      className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                    >
                      🔍 View Full Screen
                    </button>
                  </div>
                </div>
              )}

              {owner.taxId && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-medium text-gray-700 mb-2">📊 Tax ID / TIN</h3>
                  <div className="mt-2">
                    <img 
                      src={`data:image/png;base64,${owner.taxId}`}
                      alt="Tax ID"
                      className="w-full max-h-48 object-contain border rounded cursor-pointer"
                      onClick={() => handleViewDocument('Tax ID', owner.taxId)}
                    />
                    <button
                      onClick={() => handleViewDocument('Tax ID', owner.taxId)}
                      className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                    >
                      🔍 View Full Screen
                    </button>
                  </div>
                </div>
              )}

              {owner.idDocument && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-medium text-gray-700 mb-2">🪪 Government ID</h3>
                  <div className="mt-2">
                    <img 
                      src={`data:image/png;base64,${owner.idDocument}`}
                      alt="Government ID"
                      className="w-full max-h-48 object-contain border rounded cursor-pointer"
                      onClick={() => handleViewDocument('Government ID', owner.idDocument)}
                    />
                    <button
                      onClick={() => handleViewDocument('Government ID', owner.idDocument)}
                      className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                    >
                      🔍 View Full Screen
                    </button>
                  </div>
                </div>
              )}

              {!owner.businessLicense && !owner.taxId && !owner.idDocument && (
                <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                  No documents uploaded
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm text-gray-600">📝 Registered as {owner.role}</p>
                  <p className="text-xs text-gray-400">{new Date(owner.createdAt).toLocaleString()}</p>
                </div>

                {owner.verifiedAt && (
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">✅ Account verified</p>
                    <p className="text-xs text-gray-400">{new Date(owner.verifiedAt).toLocaleString()}</p>
                  </div>
                )}

                {owner.stations?.length > 0 && (
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">🏪 Registered {owner.stations.length} station(s)</p>
                    <p className="text-xs text-gray-400">
                      {owner.stations.map(s => s.name).join(', ')}
                    </p>
                  </div>
                )}

                {owner.subscriptions?.length > 0 && (
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">🔔 {owner.subscriptions.length} active subscription(s)</p>
                    <p className="text-xs text-gray-400">
                      {owner.subscriptions.map(s => `${s.station.name} (${s.fuelType})`).join(', ')}
                    </p>
                  </div>
                )}

                {owner.favorites?.length > 0 && (
                  <div className="border-l-4 border-pink-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">⭐ {owner.favorites.length} favorite station(s)</p>
                    <p className="text-xs text-gray-400">
                      {owner.favorites.map(f => f.station.name).join(', ')}
                    </p>
                  </div>
                )}

                {!owner.verifiedAt && owner.stations?.length === 0 && owner.subscriptions?.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-primary">{selectedDocument.type}</h2>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src={`data:image/png;base64,${selectedDocument.data}`}
                  alt={selectedDocument.type}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}