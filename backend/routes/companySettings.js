const express = require('express');
const router = express.Router();
const CompanySettings = require('../models/CompanySettings');

// Get company settings
router.get('/', async (req, res) => {
  try {
    const settings = await CompanySettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Update company settings
router.put('/', async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    
    if (!settings) {
      settings = new CompanySettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    settings.updatedAt = Date.now();
    await settings.save();
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

module.exports = router;
