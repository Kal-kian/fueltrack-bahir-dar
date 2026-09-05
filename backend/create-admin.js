const axios = require('axios')

const API_URL = 'http://localhost:5000/api'

async function createAdmin() {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin User',
      email: 'admin@fueltrack.com',
      phone: '0912345678',
      password: 'admin123',
      role: 'ADMIN'
    })
    console.log('✅ Admin created:', res.data)
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
  }
}

createAdmin()