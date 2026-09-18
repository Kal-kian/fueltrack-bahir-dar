import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Logo from './Logo'
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils'
import { useNavigate } from 'react-router-dom'

export default function OwnerHeader() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-20">
  <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center">
    {/* Logo */}
    <Link to="/owner" className="flex items-center gap-2">
      <Logo size="sm" showText={true} textColor="text-white" textSize="text-lg sm:text-xl" />
    </Link>

    {/* Right side */}
    <div className="flex items-center gap-2 sm:gap-4">
      <Link
        to="/owner/documents"
        className="text-xs sm:text-sm hover:text-gray-200 transition px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
      >
        <span className="hidden sm:inline">Documents</span>
        <span className="sm:hidden">Docs</span>
      </Link>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 sm:gap-3 hover:bg-white/10 px-2 sm:px-3 py-2 rounded-lg transition"
        >
          {user?.profileImage ? (
            <img 
              src={getImageSrc(user.profileImage)}
              alt={user.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-xs sm:text-sm font-bold"
            style={{ display: user?.profileImage ? 'none' : 'flex' }}
          >
            {getAvatarLetter(user?.name)}
          </div>
          <span className="font-medium hidden md:inline text-sm">{user?.name || 'User'}</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg py-1 z-30">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              Profile & Settings
            </Link>
            <Link
              to="/owner/documents"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              Documents
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false)
                logout()
                window.location.href = '/login'
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
</header>
  )
}