import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import Footer from '../components/Footer'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(null)
  const [fullScreenImage, setFullScreenImage] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchAllStations()
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/admin/verifications/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPendingUsers(res.data)
    } catch (error) {
      console.error('Error fetching pending users:', error)
    }
  }

  const fetchAllStations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/admin/stations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStations(res.data)
    } catch (error) {
      console.error('Error fetching stations:', error)
      toast.error('Failed to load stations')
      setStations([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (stationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/stations/${stationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('✅ Station approved!')
      fetchAllStations()
    } catch (error) {
      console.error('Error approving station:', error)
      toast.error('Failed to approve station')
    }
  }

  const handleReject = async (stationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/stations/${stationId}/reject`,
        { reason: rejectReason || 'No reason provided' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('❌ Station rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setRejectingId(null)
      fetchAllStations()
    } catch (error) {
      console.error('Error rejecting station:', error)
      toast.error('Failed to reject station')
    }
  }

  const handleVerify = async (userId, decision) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/admin/verify/${userId}`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`User ${decision.toLowerCase()} successfully`)
      fetchPendingUsers()
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Failed to verify user')
    }
  }

  const handleViewDocuments = (user) => {
    setSelectedDocuments(user)
    setShowDocumentModal(true)
  }

  const openRejectModal = (stationId) => {
    setRejectingId(stationId)
    setShowRejectModal(true)
  }

  const handleViewDetails = (station) => {
    setSelectedStation(station)
    setShowDetailsModal(true)
  }

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(search.toLowerCase()) ||
                          station.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          station.location.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'PENDING') return matchesSearch && !station.isApproved
    if (filter === 'APPROVED') return matchesSearch && station.isApproved
    return matchesSearch
  })

  const pendingCount = stations.filter(s => !s.isApproved).length
  const approvedCount = stations.filter(s => s.isApproved).length

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
              Manage All
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-sm hover:text-gray-200 transition text-white"
              >
                <span> {user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile & Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      logout()
                      navigate('/login')
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                     Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Station Approvals</h1>
            <p className="text-gray-500 text-sm">{pendingCount} pending — Review and approve station registrations</p>
          </div>
          <button
            onClick={fetchAllStations}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition text-sm mt-2 md:mt-0"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold">{approvedCount}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold">{stations.length}</div>
            <div className="text-sm text-gray-500">Total Stations</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search stations, owners..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED'].map((option) => (
              <button
                key={option}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === option
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading stations...</div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow">
            <p className="text-gray-500">No stations found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Station</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fuel</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map((station, index) => (
                    <tr key={station.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-3 text-sm font-medium">{station.name}</td>
                      <td className="px-6 py-3 text-sm">
                        <div className="font-medium">{station.owner?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{station.owner?.email || ''}</div>
                      </td>
                      <td className="px-6 py-3 text-sm">{station.location}</td>
                      <td className="px-6 py-3 text-sm">{station.fuelTypes}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          station.isApproved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {station.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {!station.isApproved && (
                            <>
                              <button
                                onClick={() => handleApprove(station.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(station.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(station)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 transition"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Verifications Section */}
<div className="bg-white rounded-xl shadow-md p-6 mt-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">
   Pending Verifications ({pendingUsers.length})
  </h2>
  
  {pendingUsers.length === 0 ? (
    <div className="text-center py-6 text-gray-500">
      ✅ No pending verifications. All users are verified.
    </div>
  ) : (
    <div className="space-y-4">
      {pendingUsers.map(user => (
        <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              {/* ✅ Profile Picture */}
              {user.profileImage ? (
                <img 
                  src={`${API_URL.replace('/api', '')}${user.profileImage}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                <p className="text-gray-600 text-sm">📧 {user.email}</p>
                <p className="text-gray-600 text-sm">📞 {user.phone}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                {user.verificationStatus}
              </span>
              {user.businessLicense && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📄 License</span>}
              {user.taxId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">📊 Tax ID</span>}
              {user.idDocument && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🪪 ID</span>}
            </div>
            <div className="flex gap-3 mt-3 md:mt-0 flex-wrap">
              <button
                onClick={() => handleViewDocuments(user)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                View Documents
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
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
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

      {/* Modals */}
      {showDetailsModal && selectedStation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-primary">{selectedStation.name}</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-500">Location</label><p className="font-medium">{selectedStation.location}</p></div>
                  <div><label className="text-sm text-gray-500">Contact</label><p className="font-medium">{selectedStation.contactPhone || 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-500">Fuel Types</label><p className="font-medium">{selectedStation.fuelTypes}</p></div>
                  <div><label className="text-sm text-gray-500">Status</label>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedStation.isApproved 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedStation.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Owner Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-500">Name</label><p className="font-medium">{selectedStation.owner?.name || 'Unknown'}</p></div>
                    <div><label className="text-sm text-gray-500">Email</label><p className="font-medium">{selectedStation.owner?.email || 'N/A'}</p></div>
                    <div><label className="text-sm text-gray-500">Phone</label><p className="font-medium">{selectedStation.owner?.phone || 'N/A'}</p></div>
                    <div><label className="text-sm text-gray-500">Submitted</label><p className="font-medium">{new Date(selectedStation.createdAt).toLocaleString()}</p></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {!selectedStation.isApproved && (
                  <>
                    <button onClick={() => { handleApprove(selectedStation.id); setShowDetailsModal(false); }} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                      ✓ Approve
                    </button>
                    <button onClick={() => { setShowDetailsModal(false); openRejectModal(selectedStation.id); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                      ✕ Reject
                    </button>
                  </>
                )}
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Reject Station</h2>
              <p className="text-gray-600 text-sm mb-4">Please provide a reason for rejecting this station.</p>
              <textarea
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectingId(null); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button onClick={() => handleReject(rejectingId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                  Confirm Rejection
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