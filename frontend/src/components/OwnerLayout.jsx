import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Logo from './Logo'
import Footer from './Footer'

export default function OwnerLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const navItems = [
    { path: '/owner/my-stations', label: 'My Stations' },
    { path: '/owner/add-station', label: 'Add Station' },
    { path: '/owner/subscribers', label: 'Subscribers' },
    { path: '/owner/documents', label: '📄 Documents' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white flex flex-col shadow-lg">
          {/* Logo */}
          <div className="p-6">
            <Logo size="sm" showText={true} textColor="text-white" textSize="text-xl" />
            <p className="text-xs opacity-75 mt-1 text-white">Station Owner</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ✅ Profile Section - Bottom of Sidebar */}
          <div className="p-4 border-t border-white/20 bg-primary/80">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              {user?.profileImage ? (
                <img 
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold"
                style={{ display: user?.profileImage ? 'none' : 'flex' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs opacity-75 truncate">Station Owner</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  window.location.href = '/login'
                }}
                className="text-white/60 hover:text-white transition text-sm"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  )
}