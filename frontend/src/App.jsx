import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminManagement from './pages/AdminManagement'
import AddStation from './pages/AddStation'
import UpdateStatus from './pages/UpdateStatus'
import StationDetails from './pages/StationDetails'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DocumentUpload from './pages/DocumentUpload'
import ProtectedRoute from './components/ProtectedRoute'
import Logo from './components/Logo'
import AdminOwnerDetails from './pages/AdminOwnerDetails'
import Footer from './components/Footer' 

function Home() {
  const { user } = useAuth()
  
  // If user is logged in, redirect to their dashboard
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'STATION_OWNER') return <Navigate to="/owner" replace />
    return <Navigate to="/dashboard" replace />
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        {/* ✅ Centered Logo - Same size as Login page */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={true} textColor="text-black" textSize="text-3xl" layout="vertical" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FuelTrack</h2>
        <p className="text-gray-500 text-sm mb-6">
          Real-time fuel availability in Bahir Dar, Ethiopia
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/login" 
            className="block w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Create Account
          </Link>
        </div>
        
        <p className="text-center mt-6 text-gray-400 text-xs">
          Real-time fuel availability · Bahir Dar, Ethiopia
        </p>
      </div>
       <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Owner Routes */}
          <Route path="/admin/owner/:userId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminOwnerDetails /></ProtectedRoute>} />

          <Route path="/owner" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/my-stations" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/add-station" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><AddStation /></ProtectedRoute>} />
          <Route path="/owner/documents" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><DocumentUpload /></ProtectedRoute>} />
          <Route path="/owner/update-status/:stationId" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><UpdateStatus /></ProtectedRoute>} />
          <Route path="/owner/station/:stationId" element={<ProtectedRoute allowedRoles={['STATION_OWNER']}><StationDetails /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/manage" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminManagement /></ProtectedRoute>} />
          
          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App