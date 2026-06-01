import { enhancePresets, getImageUrl } from '../utils/imageEnhancer';

/**
 * EnhancedImage Component
 * Automatically applies Cloudinary enhancements to product images
 * 
 * @param {string} src - Image URL (can be relative or absolute)
 * @param {string} preset - Enhancement preset: 'thumbnail', 'card', 'detail', 'hero'
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - CSS class name
 * @param {object} style - Inline styles
 * @param {function} onError - Error handler
 * @param {function} onClick - Click handler
 * @param {string} loading - Loading strategy: 'lazy' or 'eager'
 */
const EnhancedImage = ({ 
  src, 
  preset = 'card', 
  alt = '', 
  className = '', 
  style = {},
  onError,
  onClick,
  loading = 'lazy',
  ...props 
}) => {
  if (!src) {
    return (
      <div className={`enhanced-image-placeholder ${className}`} style={style}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
    );
  }

  // Get the full image URL
  const imageUrl = getImageUrl(src);
  
  // Apply enhancement preset
  const enhancedUrl = enhancePresets[preset] 
    ? enhancePresets[preset](imageUrl) 
    : imageUrl;

  return (
    <img
      src={enhancedUrl}
      alt={alt}
      className={className}
      style={style}
      onError={onError}
      onClick={onClick}
      loading={loading}
      {...props}
    />
  );
};

export default EnhancedImage;
