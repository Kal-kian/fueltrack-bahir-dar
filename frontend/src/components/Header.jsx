import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageSrc, getAvatarLetter } from '../utils/imageUtils';
import Logo from './Logo';

export default function Header({ title, subtitle, userRole }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Logo 
              size="lg" 
              showText={true} 
              textColor="text-white" 
              textSize="text-2xl"
              layout="horizontal"
            />
          </Link>
          
          {/* Badges */}
          <div className="flex items-center gap-2 ml-2">
            {subtitle && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">
                {subtitle}
              </span>
            )}
            {userRole && (
              <span className="text-xs bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-200 border border-yellow-400/30">
                {userRole}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Profile Picture + User Name with Dropdown */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 text-sm hover:text-gray-200 transition text-white"
            >
              {/* ✅ Profile Picture */}
              {user?.profileImage ? (
                <img 
                  src={getImageSrc(user.profileImage)}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              {/* Fallback avatar if no image */}
              <div 
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium"
                style={{ display: user?.profileImage ? 'none' : 'flex' }}
              >
                {getAvatarLetter(user?.name)}
              </div>
              {/* ✅ User Name - Always visible */}
              <span className="font-medium">{user?.name || 'User'}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
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
                    setShowDropdown(false); 
                    handleLogout(); 
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
  );
}