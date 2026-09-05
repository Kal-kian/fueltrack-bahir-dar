import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import SimpleFooter from '../components/SimpleFooter'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email })
      setSubmitted(true)
      toast.success('Password reset link sent!')
    } catch (error) {
      toast.error('Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo 
            size="lg" 
            showText={true} 
            textColor="text-black" 
            textSize="text-3xl" 
            layout="vertical" 
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Enter your email and we'll send you a link to reset your password
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
            <p className="font-medium">✅ Check your email</p>
            <p className="text-sm mt-1">We've sent a password reset link to your email.</p>
            <Link to="/login" className="text-primary font-medium hover:underline block mt-4">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
        <SimpleFooter />
      </div>
         
    </div>
  )
}