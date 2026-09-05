import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils'

export default function AdminManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stations')
  const [stations, setStations] = useState([])
  const [users, setUsers] = useState([])
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(null)
  const [fullScreenImage, setFullScreenImage] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (activeTab === 'stations') {
        const res = await axios.get(`${API_URL}/admin/stations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStations(res.data)
      } else if (activeTab === 'users') {
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(res.data)
      } else if (activeTab === 'verifications') {
        const res = await axios.get(`${API_URL}/admin/verifications/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPendingVerifications(res.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId, decision) => {
    try {
      const token = localStorage.getItem('token')
      const reason = decision === 'REJECTED' ? prompt('Enter rejection reason:') : undefined
      
      await axios.post(
        `${API_URL}/admin/verify/${userId}`,
        { decision, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`User ${decision.toLowerCase()} successfully`)
      fetchData()
    } catch (error) {
      toast.error('Failed to verify user')
    }
  }

  const handleViewDocuments = (user) => {
    setSelectedDocuments(user)
    setShowDocumentModal(true)
  }

  const handleToggleActive = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/admin/users/${userId}/toggle-active`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('User deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleDeleteStation = async (stationId) => {
    if (!confirm('Are you sure you want to delete this station? This cannot be undone.')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/admin/stations/${stationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Station deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete station')
    }
  }

  const tabs = [
    { id: 'stations', label: 'Stations' },
    { id: 'users', label: 'Users' },
    { id: 'verifications', label: 'Verifications' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-primary text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo size="sm" showText={true} textColor="text-white" textSize="text-xl" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">ADMIN</span>
          </Link>
          <div className="flex items-center space-x-4">
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

      <div className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-6 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} {activeTab === 'verifications' && pendingVerifications.length > 0 && `(${pendingVerifications.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Stations Tab */}
            {activeTab === 'stations' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Station</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((station) => (
                        <tr key={station.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm">{station.name || station.stationName}</td>
                          <td className="px-6 py-3 text-sm">{station.owner?.name || 'Unknown'}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              station.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {station.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => handleDeleteStation(station.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {stations.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-gray-500">
                            No stations found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab - FIXED */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Verified</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm">
                            <div className="flex items-center gap-3">
                              {/* Profile Picture */}
                              {user.profileImage ? (
                                <img 
                                  src={getImageSrc(user.profileImage)}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    const sibling = e.target.nextSibling
                                    if (sibling) sibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              {/* ✅ FIXED: getAvatarLetter is now imported */}
                              <div 
                                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold"
                                style={{ display: user.profileImage ? 'none' : 'flex' }}
                              >
                                {getAvatarLetter(user.name)}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm">{user.email}</td>
                          <td className="px-6 py-3 text-sm capitalize">{user.role?.toLowerCase().replace('_', ' ')}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleToggleActive(user.id, user.isActive !== false)}
                                className={`text-sm ${
                                  user.isActive !== false 
                                    ? 'text-yellow-600 hover:text-yellow-800' 
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                              >
                                {user.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => navigate(`/admin/owner/${user.id}`)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                {pendingVerifications.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl shadow">
                    <p className="text-gray-500">✅ No pending verifications. All users are verified.</p>
                  </div>
                ) : (
                  pendingVerifications.map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                          <p className="text-gray-600 text-sm">📧 {user.email}</p>
                          <p className="text-gray-600 text-sm">📞 {user.phone}</p>
                          <p className="text-sm text-gray-500 mt-1">Submitted: {new Date(user.createdAt).toLocaleDateString()}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {user.businessLicense && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📄 License</span>}
                            {user.taxId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">📊 Tax ID</span>}
                            {user.idDocument && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🪪 ID</span>}
                            {!user.businessLicense && !user.taxId && !user.idDocument && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⚠️ No documents uploaded</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3 md:mt-0 flex-wrap">
                          <button
                            onClick={() => handleViewDocuments(user)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            📄 View Documents
                          </button>
                          <button
                            onClick={() => handleVerify(user.id, 'APPROVED')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleVerify(user.id, 'REJECTED')}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            ❌ Reject
                          </button>
                          <button
                            onClick={() => navigate(`/admin/owner/${user.id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            👁️ View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-primary">Documents for {selectedDocuments.name}</h2>
                <button
                  onClick={() => {
                    setShowDocumentModal(false)
                    setSelectedDocuments(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business License */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">📄 Business License</h3>
                  {selectedDocuments.businessLicense ? (
                    <div>
                      <img 
                        src={`data:image/png;base64,${selectedDocuments.businessLicense}`}
                        alt="Business License"
                        className="w-full max-h-64 object-contain border rounded cursor-pointer"
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.businessLicense, 
                          title: `${selectedDocuments.name} - Business License` 
                        })}
                      />
                      <button
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.businessLicense, 
                          title: `${selectedDocuments.name} - Business License` 
                        })}
                        className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                      >
                        🔍 View Full Screen
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No document uploaded</p>
                  )}
                </div>

                {/* Tax ID */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">📊 Tax ID / TIN</h3>
                  {selectedDocuments.taxId ? (
                    <div>
                      <img 
                        src={`data:image/png;base64,${selectedDocuments.taxId}`}
                        alt="Tax ID"
                        className="w-full max-h-64 object-contain border rounded cursor-pointer"
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.taxId, 
                          title: `${selectedDocuments.name} - Tax ID` 
                        })}
                      />
                      <button
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.taxId, 
                          title: `${selectedDocuments.name} - Tax ID` 
                        })}
                        className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                      >
                        🔍 View Full Screen
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No document uploaded</p>
                  )}
                </div>

                {/* Government ID */}
                <div className="border rounded-lg p-4 md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2">🪪 Government ID</h3>
                  {selectedDocuments.idDocument ? (
                    <div>
                      <img 
                        src={`data:image/png;base64,${selectedDocuments.idDocument}`}
                        alt="Government ID"
                        className="w-full max-h-64 object-contain border rounded cursor-pointer"
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.idDocument, 
                          title: `${selectedDocuments.name} - Government ID` 
                        })}
                      />
                      <button
                        onClick={() => setFullScreenImage({ 
                          data: selectedDocuments.idDocument, 
                          title: `${selectedDocuments.name} - Government ID` 
                        })}
                        className="mt-2 text-blue-600 hover:underline text-sm w-full text-center"
                      >
                        🔍 View Full Screen
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No document uploaded</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDocumentModal(false)
                    setSelectedDocuments(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-primary">{fullScreenImage.title}</h2>
              <button
                onClick={() => setFullScreenImage(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src={`data:image/png;base64,${fullScreenImage.data}`}
                alt={fullScreenImage.title}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setFullScreenImage(null)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}