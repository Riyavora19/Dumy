const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { quotationStorage } = require('../config/cloudinary');

// Configure multer with Cloudinary storage
const upload = multer({
  storage: quotationStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// In-memory storage for quotation settings (you can replace this with MongoDB)
let quotationSettings = {
  footerLogos: [
    { id: 1, name: 'Artize', path: '/company-logos/Artize.png', order: 1, active: true },
    { id: 2, name: 'Duravit', path: '/company-logos/Duravit.png', order: 2, active: true },
    { id: 3, name: 'Jaguar', path: '/company-logos/Jaguar.png', order: 3, active: true },
    { id: 4, name: 'Johnson', path: '/company-logos/Johnson.png', order: 4, active: true },
    { id: 5, name: 'Kajaria', path: '/company-logos/Kajaria.png', order: 5, active: true },
    { id: 6, name: 'Kohler', path: '/company-logos/Kohler.png', order: 6, active: true },
    { id: 7, name: 'Milagro', path: '/company-logos/Milagro.png', order: 7, active: true },
    { id: 8, name: 'Parryware', path: '/company-logos/Parryware.png', order: 8, active: true },
    { id: 9, name: 'Qutone', path: '/company-logos/Qutone.png', order: 9, active: true },
    { id: 10, name: 'Simero', path: '/company-logos/Simero.png', order: 10, active: true },
    { id: 11, name: 'Simpolo', path: '/company-logos/Simpolo.png', order: 11, active: true },
    { id: 12, name: 'TrueBlock', path: '/company-logos/TrueBlock.png', order: 12, active: true },
    { id: 13, name: 'Woven', path: '/company-logos/Woven.png', order: 13, active: true }
  ]
};

// Function to reset to default logos (ensures all 13 are active on server restart)
const resetToDefaultLogos = () => {
  quotationSettings.footerLogos = [
    { id: 1, name: 'Artize', path: '/company-logos/Artize.png', order: 1, active: true },
    { id: 2, name: 'Duravit', path: '/company-logos/Duravit.png', order: 2, active: true },
    { id: 3, name: 'Jaguar', path: '/company-logos/Jaguar.png', order: 3, active: true },
    { id: 4, name: 'Johnson', path: '/company-logos/Johnson.png', order: 4, active: true },
    { id: 5, name: 'Kajaria', path: '/company-logos/Kajaria.png', order: 5, active: true },
    { id: 6, name: 'Kohler', path: '/company-logos/Kohler.png', order: 6, active: true },
    { id: 7, name: 'Milagro', path: '/company-logos/Milagro.png', order: 7, active: true },
    { id: 8, name: 'Parryware', path: '/company-logos/Parryware.png', order: 8, active: true },
    { id: 9, name: 'Qutone', path: '/company-logos/Qutone.png', order: 9, active: true },
    { id: 10, name: 'Simero', path: '/company-logos/Simero.png', order: 10, active: true },
    { id: 11, name: 'Simpolo', path: '/company-logos/Simpolo.png', order: 11, active: true },
    { id: 12, name: 'TrueBlock', path: '/company-logos/TrueBlock.png', order: 12, active: true },
    { id: 13, name: 'Woven', path: '/company-logos/Woven.png', order: 13, active: true }
  ];
};

// Initialize on server start
resetToDefaultLogos();

// GET - Get quotation settings
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: quotationSettings
    });
  } catch (error) {
    console.error('Error fetching quotation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotation settings'
    });
  }
});

// POST - Upload new logo
router.post('/upload-logo', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Logo name is required'
      });
    }

    // Check if we already have 13 logos
    if (quotationSettings.footerLogos.length >= 13) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Maximum 13 logos allowed'
      });
    }

    const newLogo = {
      id: Date.now(),
      name: name,
      path: req.file.path, // Cloudinary returns full URL in file.path
      order: quotationSettings.footerLogos.length + 1,
      active: true
    };

    quotationSettings.footerLogos.push(newLogo);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: newLogo
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo'
    });
  }
});

// PUT - Update logo order
router.put('/reorder', (req, res) => {
  try {
    const { logos } = req.body;

    if (!logos || !Array.isArray(logos)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid logos data'
      });
    }

    // Update the order
    quotationSettings.footerLogos = logos.map((logo, index) => ({
      ...logo,
      order: index + 1
    }));

    res.json({
      success: true,
      message: 'Logo order updated successfully',
      data: quotationSettings.footerLogos
    });
  } catch (error) {
    console.error('Error reordering logos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder logos'
    });
  }
});

// DELETE - Remove logo from quotation (hide, not delete permanently)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const logo = quotationSettings.footerLogos.find(logo => logo.id === parseInt(id));

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Mark as inactive instead of deleting
    logo.active = false;
    logo.order = 999; // Move to end

    // Reorder active logos
    const activeLogos = quotationSettings.footerLogos.filter(l => l.active);
    activeLogos.forEach((logo, index) => {
      logo.order = index + 1;
    });

    res.json({
      success: true,
      message: 'Logo removed from quotation'
    });
  } catch (error) {
    console.error('Error removing logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove logo'
    });
  }
});

// PUT - Add logo back to quotation (activate)
router.put('/activate/:id', (req, res) => {
  try {
    const { id } = req.params;
    const logo = quotationSettings.footerLogos.find(logo => logo.id === parseInt(id));

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Check if we already have 13 active logos
    const activeLogos = quotationSettings.footerLogos.filter(l => l.active);
    if (activeLogos.length >= 13) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 13 logos allowed in quotation'
      });
    }

    // Mark as active
    logo.active = true;
    logo.order = activeLogos.length + 1;

    res.json({
      success: true,
      message: 'Logo added to quotation',
      data: logo
    });
  } catch (error) {
    console.error('Error activating logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate logo'
    });
  }
});

// DELETE - Permanently delete logo (only for uploaded logos)
router.delete('/permanent/:id', (req, res) => {
  try {
    const { id } = req.params;
    const logoIndex = quotationSettings.footerLogos.findIndex(logo => logo.id === parseInt(id));

    if (logoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    const logo = quotationSettings.footerLogos[logoIndex];

    // Only allow permanent deletion of uploaded logos
    if (!logo.path.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot permanently delete default logos'
      });
    }

    // Delete the file
    const filePath = path.join(__dirname, '..', logo.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    quotationSettings.footerLogos.splice(logoIndex, 1);

    // Reorder remaining active logos
    const activeLogos = quotationSettings.footerLogos.filter(l => l.active);
    activeLogos.forEach((logo, index) => {
      logo.order = index + 1;
    });

    res.json({
      success: true,
      message: 'Logo deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting logo permanently:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo permanently'
    });
  }
});

module.exports = router;
