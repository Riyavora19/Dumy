const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gtss/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for company logos
const companyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gtss/companies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for review images
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gtss/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for quotation logos
const quotationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gtss/quotation-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 200, crop: 'limit', quality: 'auto' }],
  },
});

module.exports = { cloudinary, productStorage, companyStorage, reviewStorage, quotationStorage };
