import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get(`${API_URL}/auth/me`)
        .then(res => {
          // Fix profile image URL if exists
          if (res.data.profileImage) {
            res.data.profileImage = `${API_URL.replace('/api', '')}${res.data.profileImage}`
          }
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ✅ ONLY ONE login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fix profile image URL if exists
      if (user.profileImage) {
        user.profileImage = `${API_URL.replace('/api', '')}${user.profileImage}`
      }
      
      setUser(user)
      return user
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  }

  const register = async (name, email, phone, password, role, businessLicense, taxId, idDocument, agreedToTerms) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      phone,
      password,
      role,
      businessLicense,
      taxId,
      idDocument,
      agreedToTerms
    })
    return res.data
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message)
    throw error
  }
}

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
const register = async (name, email, phone, password, role, businessLicense, taxId, idDocument, agreedToTerms) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      phone,
      password,
      role,
      businessLicense,
      taxId,
      idDocument,
      agreedToTerms
    })
    return res.data
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message)
    throw error
  }
}

