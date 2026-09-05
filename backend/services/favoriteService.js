const createFavoriteService = (prisma) => {
  console.log('✅ Favorite service initialized')

  const addFavorite = async (userId, stationId) => {
    try {
      const favorite = await prisma.favorite.create({
        data: {
          userId: userId,
          stationId: parseInt(stationId)
        },
        include: {
          station: true
        }
      })
      return favorite
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Station already in favorites')
      }
      throw error
    }
  }

  const removeFavorite = async (userId, stationId) => {
    try {
      const result = await prisma.favorite.delete({
        where: {
          userId_stationId: {
            userId: userId,
            stationId: parseInt(stationId)
          }
        }
      })
      return result
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Station not in favorites')
      }
      throw error
    }
  }

  const getFavorites = async (userId) => {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: userId },
        include: {
          station: {
            include: {
              fuelStatuses: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return favorites
    } catch (error) {
      console.error('Error getting favorites:', error)
      throw error
    }
  }

  const isFavorite = async (userId, stationId) => {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_stationId: {
            userId: userId,
            stationId: parseInt(stationId)
          }
        }
      })
      return !!favorite
    } catch (error) {
      console.error('Error checking favorite:', error)
      return false
    }
  }

  return {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite
  }
}

module.exports = createFavoriteService