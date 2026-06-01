const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const { v4: uuidv4 } = require('uuid');

// Start a new chat session
router.post('/start', async (req, res) => {
  try {
    const { userName, userEmail } = req.body;

    if (!userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const sessionId = uuidv4();

    const chatSession = new ChatSession({
      sessionId,
      userName,
      userEmail,
      messages: [],
      status: 'active'
    });

    await chatSession.save();

    res.status(201).json({
      success: true,
      message: 'Chat session started',
      data: {
        sessionId,
        userName,
        userEmail
      }
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: error.message
    });
  }
});

// Send a message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, userName, userEmail } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    let chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      // Create new session if not found
      chatSession = new ChatSession({
        sessionId,
        userName: userName || 'Guest',
        userEmail: userEmail || 'guest@example.com',
        messages: [],
        status: 'active'
      });
    }

    chatSession.messages.push({
      text: message,
      sender: 'user',
      timestamp: new Date()
    });

    await chatSession.save();

    res.status(200).json({
      success: true,
      message: 'Message sent',
      data: {
        sessionId,
        messageCount: chatSession.messages.length
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get chat session messages
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chatSession
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat session',
      error: error.message
    });
  }
});

// Get all active chat sessions (for admin)
router.get('/sessions/active', async (req, res) => {
  try {
    const chatSessions = await ChatSession.find({ status: 'active' })
      .sort({ updatedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: chatSessions
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: error.message
    });
  }
});

// Send support reply
router.post('/reply', async (req, res) => {
  try {
    const { sessionId, message, adminId } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    const chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatSession.messages.push({
      text: message,
      sender: 'support',
      timestamp: new Date()
    });

    if (adminId && !chatSession.assignedTo) {
      chatSession.assignedTo = adminId;
    }

    await chatSession.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent',
      data: {
        sessionId,
        messageCount: chatSession.messages.length
      }
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
});

// Close chat session
router.patch('/session/:sessionId/close', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatSession.status = 'closed';
    await chatSession.save();

    res.status(200).json({
      success: true,
      message: 'Chat session closed',
      data: chatSession
    });
  } catch (error) {
    console.error('Error closing chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close chat session',
      error: error.message
    });
  }
});

module.exports = router;
