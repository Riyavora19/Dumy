const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss-db';

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Default admin already exists');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Create default admin
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'super-admin',
      isActive: true
    });

    await admin.save();

    console.log('✅ Default admin created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  DEFAULT ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createDefaultAdmin();
