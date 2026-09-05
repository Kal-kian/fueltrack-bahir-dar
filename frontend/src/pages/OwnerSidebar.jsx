import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils'
import Logo from './Logo'

export default function OwnerSidebar({ currentPath, showDropdown, setShowDropdown, logout, navigate }) {
  const { user } = useAuth()

  // ✅ REMOVED Subscribers
  const navItems = [
    { path: '/owner/my-stations', label: 'My Stations', icon: '⛽' },
    { path: '/owner/add-station', label: 'Add Station', icon: '➕' },
    { path: '/owner/documents', label: 'Documents', icon: '📄' },
  ]

  return (
    <aside className="w-64 bg-primary text-white flex flex-col shadow-lg fixed h-full z-10">
      <div className="p-6 border-b border-white/10">
        <Link to="/owner" className="flex items-center gap-3">
          <Logo size="sm" showText={true} textColor="text-white" textSize="text-xl" layout="horizontal" />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-white ${
              currentPath === item.path
                ? 'bg-white/20 font-semibold'
                : 'hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 w-full hover:bg-white/10 rounded-lg p-2 transition"
        >
          {user?.profileImage ? (
            <img 
              src={getImageSrc(user.profileImage)}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
              {getAvatarLetter(user?.name)}
            </div>
          )}
          <span className="flex-1 text-left text-sm truncate">{user?.name || 'User'}</span>
        </button>
        
        {showDropdown && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              ⚙️ Profile & Settings
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false)
                logout()
                navigate('/login')
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}