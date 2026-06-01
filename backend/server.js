const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://my-dumy.vercel.app',
  'https://dumy-delta.vercel.app',
  'https://my-dumy-git-main-riyavora19s-projects.vercel.app',
  'https://my-dumy-825yrtsga-riyavora19s-projects.vercel.app',
  'https://dumy-git-main-riyavora19s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any vercel.app subdomain (covers all preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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

// Inquiry routesin
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

// Budget Plan Preset routes
app.use('/api/budget-plan-presets', require('./routes/budgetPlanPresets'));

// Client routes
app.use('/api/clients', require('./routes/clients'));

// Live Request routes
app.use('/api/live-requests', require('./routes/liveRequests'));

// Review routes
app.use('/api/reviews', require('./routes/reviews'));

// Contact routes
app.use('/api/contacts', require('./routes/contacts'));

// Relationship routes
app.use('/api/relationships', require('./routes/relationships'));

// Order routes
app.use('/api/orders', require('./routes/orders'));

// Company Settings routes
app.use('/api/company-settings', require('./routes/companySettings'));

// Staff routes
const { router: staffRouter } = require('./routes/staff');
app.use('/api/staff', staffRouter);

// Quotation Settings routes
app.use('/api/quotation-settings', require('./routes/quotationSettings'));

// Quotation lifecycle routes
app.use('/api/quotations', require('./routes/quotations'));

// Delivery routes
app.use('/api/deliveries', require('./routes/deliveries'));

// Payment routes
app.use('/api/payments', require('./routes/payments'));

// Chat routes
app.use('/api/chat', require('./routes/chat'));

// Chat Settings routes
app.use('/api/chat-settings', require('./routes/chatSettings'));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
