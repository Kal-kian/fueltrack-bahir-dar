

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const createFavoriteService = require('./services/favoriteService')
const { sendPasswordResetEmail } = require('./services/emailService')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.uxflafnbfjugqnjzwdts:%2312%40AB%2334%40bc@3.139.14.59:5432/postgres?sslmode=disable"

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

// Initialize favorite service
const favoriteService = createFavoriteService(prisma)

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Middleware
// Update CORS to allow your production frontend URL
app.use(cors({
  origin: [
    'http://localhost:5173',     // Development
    'https://fueltrack-bahir-dar.vercel.app'  
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ============ AUTH MIDDLEWARE ============
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
  }
  next()
}

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      role, 
      businessLicense, 
      taxId, 
      idDocument, 
      agreedToTerms 
    } = req.body

    console.log('📝 Registering user:', { name, email, role })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'USER',
        businessLicense: businessLicense || null,
        taxId: taxId || null,
        idDocument: idDocument || null,
        agreedToTerms: agreedToTerms || false,
        verificationStatus: role === 'STATION_OWNER' ? 'PENDING' : 'APPROVED',
        isVerified: role !== 'STATION_OWNER',
        isActive: true
      },
    })

    console.log('✅ User registered:', user.id)

    res.status(201).json({
      message: 'Registration successful',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    console.error('❌ Register error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        isActive: true,
        profileImage: true,
        verificationStatus: true,
        isVerified: true
      }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    if (user.isActive === false) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' })
    }
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        isVerified: true,
        verificationStatus: true,
        createdAt: true,
        agreedToTerms: true
      }
    })
    res.json(user)
  } catch (error) {
    console.error('Auth/me error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ PROFILE ENDPOINTS ============
app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true, profileImage: true }
    })
    res.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/auth/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })
    
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    })
    
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ PROFILE PICTURE ============
app.post('/api/users/profile-picture', authenticate, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' })
    }
    
    const buffer = Buffer.from(image, 'base64')
    const uploadDir = path.join(__dirname, '../uploads/profile')
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true })
    }
    
    const filename = `profile_${req.user.id}_${Date.now()}.jpg`
    const filepath = path.join(uploadDir, filename)
    require('fs').writeFileSync(filepath, buffer)
    
    const profileImage = `/uploads/profile/${filename}`
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        profileImage: true,
        role: true,
        phone: true
      }
    })
    
    // ✅ Return the full user with profile image
    res.json({ 
      message: 'Profile picture updated', 
      user 
    })
  } catch (error) {
    console.error('Profile picture error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ DOCUMENT ENDPOINTS ============
app.post('/api/users/documents', authenticate, authorize('STATION_OWNER'), async (req, res) => {
  try {
    const { businessLicense, taxId, idDocument } = req.body
    
    const updateData = {}
    
    if (businessLicense) {
      const filename = `license_${req.user.id}_${Date.now()}.jpg`
      const filepath = path.join(__dirname, '../uploads/documents', filename)
      if (!require('fs').existsSync(path.join(__dirname, '../uploads/documents'))) {
        require('fs').mkdirSync(path.join(__dirname, '../uploads/documents'), { recursive: true })
      }
      require('fs').writeFileSync(filepath, Buffer.from(businessLicense, 'base64'))
      updateData.businessLicense = `/uploads/documents/${filename}`
    }
    
    if (taxId) {
      const filename = `tax_${req.user.id}_${Date.now()}.jpg`
      const filepath = path.join(__dirname, '../uploads/documents', filename)
      require('fs').writeFileSync(filepath, Buffer.from(taxId, 'base64'))
      updateData.taxId = `/uploads/documents/${filename}`
    }
    
    if (idDocument) {
      const filename = `id_${req.user.id}_${Date.now()}.jpg`
      const filepath = path.join(__dirname, '../uploads/documents', filename)
      require('fs').writeFileSync(filepath, Buffer.from(idDocument, 'base64'))
      updateData.idDocument = `/uploads/documents/${filename}`
    }
    
    updateData.verificationStatus = 'PENDING'
    updateData.isVerified = false
    updateData.rejectionReason = null
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        businessLicense: true,
        taxId: true,
        idDocument: true,
        verificationStatus: true,
        isVerified: true,
        rejectionReason: true
      }
    })
    
    res.json({ message: 'Documents uploaded successfully', user })
  } catch (error) {
    console.error('Document upload error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/users/verification-status', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        verificationStatus: true,
        isVerified: true,
        rejectionReason: true,
        // ✅ Make sure these are included
        businessLicense: true,
        taxId: true,
        idDocument: true
      }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
// ============ STATION ENDPOINTS ============

app.post('/api/stations', authenticate, authorize('STATION_OWNER'), async (req, res) => {
  try {
    const { name, location, contactPhone, fuelTypes } = req.body
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isVerified: true, verificationStatus: true }
    })
    
    if (!user.isVerified && user.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ error: 'Your account must be verified before adding stations. Please upload your documents.' })
    }
    
    const station = await prisma.station.create({
      data: {
        name,
        location,
        contactPhone,
        fuelTypes: fuelTypes.join(','),
        ownerId: req.user.id
      }
    })
    res.status(201).json(station)
  } catch (error) {
    console.error('Station creation error:', error)
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/stations/owner', authenticate, authorize('STATION_OWNER'), async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      where: { ownerId: req.user.id },
      include: { fuelStatuses: true }
    })
    res.json(stations)
  } catch (error) {
    console.error('Error fetching owner stations:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/stations', authenticate, async (req, res) => {
  try {
    const { fuelType, search } = req.query
    const isAdmin = req.user.role === 'ADMIN'
    
    const where = {}
    if (!isAdmin) {
      where.isApproved = true
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (fuelType && fuelType !== 'ALL') {
      where.fuelTypes = { contains: fuelType }
    }
    
    const stations = await prisma.station.findMany({
      where,
      include: { 
        fuelStatuses: true,
        owner: {
          select: { 
            id: true,
            name: true, 
            email: true, 
            phone: true 
          } 
        }
      }
    })
    res.json(stations)
  } catch (error) {
    console.error('Error fetching stations:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ GET SINGLE STATION ============
app.get('/api/stations/:id', authenticate, async (req, res) => {
  try {
    const stationId = parseInt(req.params.id)
    
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { 
        fuelStatuses: true,
        owner: {
          select: { 
            id: true,
            name: true, 
            email: true, 
            phone: true,
            profileImage: true
          } 
        }
      }
    })
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' })
    }
    
    res.json(station)
  } catch (error) {
    console.error('Error fetching station:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/stations/:id/status', authenticate, authorize('STATION_OWNER'), async (req, res) => {
  try {
    const { diesel, petrol } = req.body
    const stationId = parseInt(req.params.id)

    const station = await prisma.station.findUnique({
      where: { id: stationId, ownerId: req.user.id }
    })
    if (!station) return res.status(403).json({ error: 'Not your station' })
    if (!station.isApproved) {
      return res.status(400).json({ error: 'Station must be approved before updating status' })
    }

    if (diesel) {
      await prisma.fuelStatus.upsert({
        where: { stationId_fuelType: { stationId, fuelType: 'DIESEL' } },
        update: { status: diesel, updatedAt: new Date() },
        create: { stationId, fuelType: 'DIESEL', status: diesel }
      })
    }
    if (petrol) {
      await prisma.fuelStatus.upsert({
        where: { stationId_fuelType: { stationId, fuelType: 'PETROL' } },
        update: { status: petrol, updatedAt: new Date() },
        create: { stationId, fuelType: 'PETROL', status: petrol }
      })
    }

    res.json({ message: 'Status updated' })
  } catch (error) {
    console.error('Status update error:', error)
    res.status(400).json({ error: error.message })
  }
})

// ============ ADMIN ENDPOINTS ============

app.get('/api/admin/stations', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
            verificationStatus: true
          }
        },
        fuelStatuses: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(stations)
  } catch (error) {
    console.error('Error fetching stations:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/stations/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const station = await prisma.station.update({
      where: { id: parseInt(req.params.id) },
      data: { isApproved: true }
    })
    res.json(station)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/stations/:id/reject', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const station = await prisma.station.update({
      where: { id: parseInt(req.params.id) },
      data: { isApproved: false }
    })
    res.json(station)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/admin/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        verificationStatus: true,
        isVerified: true,
        isActive: true,
        agreedToTerms: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/admin/verifications/pending', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'STATION_OWNER',
        verificationStatus: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessLicense: true,
        taxId: true,
        idDocument: true,
        verificationStatus: true,
        rejectionReason: true,
        createdAt: true
      }
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/verify/:userId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { decision, reason } = req.body
    
    const updateData = {
      verificationStatus: decision,
      isVerified: decision === 'APPROVED',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    }
    
    if (decision === 'REJECTED') {
      updateData.rejectionReason = reason || 'No reason provided'
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        isVerified: true,
        rejectionReason: true
      }
    })
    
    res.json({ message: `User ${decision.toLowerCase()} successfully`, user })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/users/:id/toggle-active', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { isActive } = req.body
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    })
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user })
  } catch (error) {
    console.error('Error toggling user status:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admin/users/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    
    const stations = await prisma.station.findMany({
      where: { ownerId: userId },
      select: { id: true }
    })
    const stationIds = stations.map(s => s.id)
    
    if (stationIds.length > 0) {
      await prisma.fuelStatus.deleteMany({ where: { stationId: { in: stationIds } } })
      await prisma.favorite.deleteMany({ where: { stationId: { in: stationIds } } })
      await prisma.station.deleteMany({ where: { ownerId: userId } })
    }
    
    await prisma.favorite.deleteMany({ where: { userId: userId } })
    await prisma.user.delete({ where: { id: userId } })
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admin/stations/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const stationId = parseInt(req.params.id)
    
    await prisma.fuelStatus.deleteMany({ where: { stationId: stationId } })
    await prisma.favorite.deleteMany({ where: { stationId: stationId } })
    await prisma.station.delete({ where: { id: stationId } })
    
    res.json({ message: 'Station deleted successfully' })
  } catch (error) {
    console.error('Error deleting station:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ FAVORITES ENDPOINTS ============
app.post('/api/favorites', authenticate, async (req, res) => {
  try {
    const { stationId } = req.body
    
    const station = await prisma.station.findUnique({
      where: { id: parseInt(stationId) }
    })
    if (!station) {
      return res.status(404).json({ error: 'Station not found' })
    }
    
    const favorite = await favoriteService.addFavorite(req.user.id, stationId)
    res.status(201).json({
      message: 'Added to favorites!',
      favorite
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    res.status(400).json({ error: error.message })
  }
})

app.delete('/api/favorites/:stationId', authenticate, async (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId)
    await favoriteService.removeFavorite(req.user.id, stationId)
    res.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Remove favorite error:', error)
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/favorites', authenticate, async (req, res) => {
  try {
    const favorites = await favoriteService.getFavorites(req.user.id)
    res.json(favorites)
  } catch (error) {
    console.error('Get favorites error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FuelTrack API is running!' })
})

// ============ ADMIN: GET OWNER DETAILS ============
app.get('/api/admin/owner/:userId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        isActive: true,
        isVerified: true,
        verificationStatus: true,
        rejectionReason: true,
        verifiedAt: true,
        businessLicense: true,
        taxId: true,
        idDocument: true,
        stations: {
          include: {
            fuelStatuses: true
          }
        },
        
        favorites: {
          include: {
            station: {
              select: {
                id: true,
                name: true,
                location: true
              }
            }
          },
          take: 10
        },
        _count: {
          select: {
            stations: true,
            favorites: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching owner details:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============ PASSWORD RESET ENDPOINTS ============

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ 
        message: 'If an account exists, a reset link will be sent to your email' 
      })
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    )
    
    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    
    // Send email
    try {
      await sendPasswordResetEmail(email, resetLink, user.name)
      console.log(`📧 Reset email sent to ${email}`)
    } catch (emailError) {
      console.error('❌ Email error:', emailError)
    }
    
    res.json({ 
      message: 'Password reset link sent to your email',
      resetLink: resetLink,
      token: resetToken
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    // ✅ Check if token and newPassword are provided
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update user
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    })
    
    res.json({ message: 'Password updated successfully!' })
  } catch (error) {
    console.error('Reset password error:', error)
    
    // ✅ Better error messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token has expired. Please request a new reset link.' })
    }
    
    res.status(400).json({ error: error.message })
  }
})
// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log('📋 Endpoints:')
  console.log('  POST /api/auth/register  - Create account')
  console.log('  POST /api/auth/login     - Login')
  console.log('  GET  /api/auth/me        - Get current user')
  console.log('  POST /api/auth/change-password - Change password')
  console.log('  POST /api/auth/forgot-password - Request password reset')
  console.log('  POST /api/auth/reset-password - Reset password with token')
  console.log('')
  console.log('📋 User Endpoints:')
  console.log('  PUT  /api/users/profile  - Update profile')
  console.log('  POST /api/users/profile-picture - Upload profile picture')
  console.log('  POST /api/users/documents - Upload documents')
  console.log('  GET  /api/users/verification-status - Check verification')
  console.log('')
  console.log('📋 Station Endpoints:')
  console.log('  POST /api/stations       - Create station')
  console.log('  GET  /api/stations       - Get all stations')
  console.log('  GET  /api/stations/owner - Get owner stations')
  console.log('  GET  /api/stations/:id   - Get single station ✅ NEW')
  console.log('  POST /api/stations/:id/status - Update fuel status')
  console.log('  PUT  /api/stations/:id/approve - Approve station (admin)')
  console.log('  PUT  /api/stations/:id/reject - Reject station (admin)')
  console.log('')
  console.log('📋 Favorites Endpoints:')
  console.log('  POST /api/favorites      - Add favorite')
  console.log('  GET  /api/favorites      - Get favorites')
  console.log('')
  console.log('📋 Admin Endpoints:')
  console.log('  GET  /api/admin/stations - Get all stations')
  console.log('  GET  /api/admin/users    - Get all users')
  console.log('  GET  /api/admin/verifications/pending - Get pending verifications')
  console.log('  POST /api/admin/verify/:userId - Verify user')
  console.log('  POST /api/admin/users/:id/toggle-active - Toggle user active')
  console.log('  GET  /api/admin/owner/:userId - Get owner details')
  console.log('  DELETE /api/admin/users/:id - Delete user')
  console.log('  DELETE /api/admin/stations/:id - Delete station')
  console.log('')
  console.log('📋 Health:')
  console.log('  GET  /api/health         - Health check')
  console.log('')
  console.log('📧 Email Configuration:')
  console.log('📧 EMAIL_USER loaded:', !!process.env.EMAIL_USER)
  console.log('📧 EMAIL_PASSWORD loaded:', !!process.env.EMAIL_PASSWORD)
  console.log('📧 EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0)
})


module.exports = { prisma }

