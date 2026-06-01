const express = require('express');
const router = express.Router();
const ChatSettings = require('../models/ChatSettings');

// Get chat settings
router.get('/', async (req, res) => {
  try {
    const settings = await ChatSettings.getSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat settings',
      error: error.message
    });
  }
});

// Update chat settings
router.put('/', async (req, res) => {
  try {
    const settings = await ChatSettings.getSettings();
    
    // Update fields
    if (req.body.autoResponseEnabled !== undefined) {
      settings.autoResponseEnabled = req.body.autoResponseEnabled;
    }
    if (req.body.autoResponseDelay !== undefined) {
      settings.autoResponseDelay = req.body.autoResponseDelay;
    }
    if (req.body.businessHoursEnabled !== undefined) {
      settings.businessHoursEnabled = req.body.businessHoursEnabled;
    }
    if (req.body.businessHours) {
      if (req.body.businessHours.start) settings.businessHours.start = req.body.businessHours.start;
      if (req.body.businessHours.end) settings.businessHours.end = req.body.businessHours.end;
      if (req.body.businessHours.days) settings.businessHours.days = req.body.businessHours.days;
    }
    if (req.body.offlineMessage) {
      settings.offlineMessage = req.body.offlineMessage;
    }

    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Chat settings updated',
      data: settings
    });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat settings',
      error: error.message
    });
  }
});

// Check if currently within business hours
router.get('/is-business-hours', async (req, res) => {
  try {
    const settings = await ChatSettings.getSettings();
    
    if (!settings.businessHoursEnabled) {
      return res.status(200).json({
        success: true,
        data: {
          isBusinessHours: true,
          message: 'Business hours check is disabled'
        }
      });
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isWorkingDay = settings.businessHours.days.includes(currentDay);
    const isWithinHours = currentTime >= settings.businessHours.start && currentTime <= settings.businessHours.end;
    const isBusinessHours = isWorkingDay && isWithinHours;

    res.status(200).json({
      success: true,
      data: {
        isBusinessHours,
        currentDay,
        currentTime,
        businessHours: settings.businessHours,
        message: isBusinessHours ? 'Within business hours' : 'Outside business hours'
      }
    });
  } catch (error) {
    console.error('Error checking business hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check business hours',
      error: error.message
    });
  }
});

module.exports = router;
