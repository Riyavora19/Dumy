const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// User routes
app.use('/api/users', require('./routes/users'));

// Inquiry routes
app.use('/api/inquiries', require('./routes/inquiries'));

// Category routes
app.use('/api/categories', require('./routes/categories'));

// Product routes
app.use('/api/products', require('./routes/products'));

// Company routes
app.use('/api/companies', require('./routes/companies'));

// Room Template routes
app.use('/api/room-templates', require('./routes/roomTemplates'));

// Product Item Type routes
app.use('/api/item-types', require('./routes/productItemTypes'));

// Budget Plan routes
app.use('/api/budget-plans', require('./routes/budgetPlans'));

// Client routes
app.use('/api/clients', require('./routes/clients'));

// Live Request routes
app.use('/api/live-requests', require('./routes/liveRequests'));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
