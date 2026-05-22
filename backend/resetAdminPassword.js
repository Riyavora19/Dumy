const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const email = 'admin@example.com';
    const newPassword = 'admin123';

    // Find admin
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    // Set new password (the pre-save hook will hash it automatically)
    admin.password = newPassword;
    await admin.save();

    console.log('✅ Password reset successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetAdminPassword();
