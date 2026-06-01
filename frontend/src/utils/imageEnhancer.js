/**
 * Cloudinary Image Enhancement Utility
 * Applies automatic transformations to enhance image quality
 */

/**
 * Enhances a Cloudinary image URL with quality improvements
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Enhancement options
 * @returns {string} Enhanced image URL
 */
export const enhanceImage = (imageUrl, options = {}) => {
  if (!imageUrl) return '';
  
  // If it's not a Cloudinary URL, return as-is
  if (!imageUrl.includes('cloudinary.com') && !imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = null,           // Target width (null = auto)
    height = null,          // Target height (null = auto)
    quality = 'auto:best',  // auto:best, auto:good, auto:eco, or 1-100
    format = 'auto',        // auto, jpg, png, webp
    enhance = true,         // Apply auto enhancement
    sharpen = true,         // Apply sharpening
    removeBackground = false, // Remove background (for product shots)
    crop = 'fill',          // fill, fit, scale, crop, thumb
  } = options;

  // Build transformation string
  const transformations = [];

  // Quality and format
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  // Auto enhancements
  if (enhance) {
    transformations.push('e_auto_color');      // Auto color correction
    transformations.push('e_auto_contrast');   // Auto contrast
    transformations.push('e_auto_brightness'); // Auto brightness
  }

  // Sharpening
  if (sharpen) {
    transformations.push('e_sharpen:100'); // Sharpen effect
  }

  // Background removal (useful for product images)
  if (removeBackground) {
    transformations.push('e_background_removal');
  }

  // DPR (Device Pixel Ratio) for retina displays
  transformations.push('dpr_auto');

  // Combine all transformations
  const transformString = transformations.join(',');

  // Insert transformations into Cloudinary URL
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const urlParts = imageUrl.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformString}/${urlParts[1]}`;
  }

  // If URL format is different, return original
  return imageUrl;
};

/**
 * Preset enhancement profiles for different use cases
 */
export const enhancePresets = {
  // Product thumbnail (small, optimized)
  thumbnail: (imageUrl) => enhanceImage(imageUrl, {
    width: 300,
    height: 300,
    quality: 'auto:good',
    crop: 'fit',
    enhance: true,
    sharpen: true,
  }),

  // Product card (medium size)
  card: (imageUrl) => enhanceImage(imageUrl, {
    width: 600,
    height: 600,
    quality: 'auto:best',
    crop: 'fit',
    enhance: true,
    sharpen: true,
  }),

  // Product detail (large, high quality)
  detail: (imageUrl) => enhanceImage(imageUrl, {
    width: 1200,
    height: 1200,
    quality: 'auto:best',
    crop: 'fit',
    enhance: true,
    sharpen: true,
  }),

  // Hero/banner images
  hero: (imageUrl) => enhanceImage(imageUrl, {
    width: 1920,
    height: 1080,
    quality: 'auto:best',
    crop: 'fill',
    enhance: true,
    sharpen: true,
  }),

  // Product with background removed
  productClean: (imageUrl) => enhanceImage(imageUrl, {
    width: 800,
    height: 800,
    quality: 'auto:best',
    crop: 'fit',
    enhance: true,
    sharpen: true,
    removeBackground: false, // Set to true if you want backgrounds removed
  }),
};

/**
 * Get the appropriate image URL based on context
 * Handles both Cloudinary and non-Cloudinary URLs
 */
export const getImageUrl = (imageUrl, baseUrl = 'https://dumy-2-mli2.onrender.com') => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, prepend base URL
  return `${baseUrl}${imageUrl}`;
};

/**
 * Enhanced image component helper
 * Returns the best image URL with enhancements
 */
export const getEnhancedProductImage = (product, preset = 'card') => {
  if (!product || !product.images || product.images.length === 0) {
    return null;
  }

  const imageUrl = getImageUrl(product.images[0]);
  
  // Apply enhancement preset
  if (enhancePresets[preset]) {
    return enhancePresets[preset](imageUrl);
  }

  // Default enhancement
  return enhanceImage(imageUrl);
};

export default enhanceImage;
