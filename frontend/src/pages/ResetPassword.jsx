import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import SimpleFooter from '../components/SimpleFooter'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setValidToken(false)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        newPassword: newPassword
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={true} textColor="text-black" textSize="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Invalid Reset Link</h2>
            <p className="text-gray-600 mt-2">The reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="text-primary hover:underline mt-4 inline-block">
              Request a new link
            </Link>
          </div>
        </div>
        <SimpleFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo size="lg" showText={true} textColor="text-black" textSize="text-4xl" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Reset Password</h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {/* ✅ Eye Icon - New Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.2 2.443 3.627 4.812 6.998 5.635.645.157 1.309.24 1.995.244" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 12.416a2.999 2.999 0 01-2.224 2.124c-.99.16-2.03-.168-2.56-.854" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12.532 15.532a3.003 3.003 0 001.342 1.843" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.003 12.32a10.477 10.477 0 01-2.976 3.788" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.605 5.283a10.475 10.475 0 01-3.098 2.687" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.321 4.295a11.09 11.09 0 016.892.248" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.63 17.63l-11.26-11.26" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {/* ✅ Eye Icon - Confirm Password */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.2 2.443 3.627 4.812 6.998 5.635.645.157 1.309.24 1.995.244" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 12.416a2.999 2.999 0 01-2.224 2.124c-.99.16-2.03-.168-2.56-.854" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12.532 15.532a3.003 3.003 0 001.342 1.843" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.003 12.32a10.477 10.477 0 01-2.976 3.788" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.605 5.283a10.475 10.475 0 01-3.098 2.687" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.321 4.295a11.09 11.09 0 016.892.248" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.63 17.63l-11.26-11.26" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      
      {/* ✅ Footer at the bottom of the page */}
      <SimpleFooter />
    </div>
  )
}