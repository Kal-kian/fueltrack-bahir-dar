// src/utils/imageUtils.js

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path from the database
 * @returns {string} - Full image URL
 */
export const getImageSrc = (imagePath) => {
  console.log('🖼️ getImageSrc called with:', imagePath);
  
  if (!imagePath) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove any leading slash to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // ✅ FIXED: Use import.meta.env for Vite instead of process.env
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const fullURL = `${baseURL}/${cleanPath}`;
  
  console.log('🖼️ Generated URL from path:', fullURL);
  return fullURL;
};

/**
 * Get avatar letter from name
 * @param {string} name - The user's name
 * @returns {string} - First letter of the name
 */
export const getAvatarLetter = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

/**
 * Get a default image for a user
 * @param {string} name - The user's name
 * @returns {string} - Avatar URL with the first letter
 */
export const getDefaultAvatar = (name) => {
  if (!name) {
    return '/default-avatar.png';
  }
  const initial = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
};

/**
 * Get a default image for an event/listing
 * @returns {string} - Default placeholder image URL
 */
export const getDefaultImage = () => {
  return '/placeholder-image.jpg';
};

// Default export for convenience
export default {
  getImageSrc,
  getAvatarLetter,
  getDefaultAvatar,
  getDefaultImage
};