const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function testAdminLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const email = 'admin@example.com';
    const password = 'admin123';

    // Find admin
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    console.log('✅ Admin found:');
    console.log('   ID:', admin._id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Password Hash:', admin.password);
    console.log('   Hash Length:', admin.password.length);
    console.log('   Hash starts with $2a$ or $2b$:', admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
    console.log('\n');

    // Test password comparison using the model method
    console.log('Testing password comparison with model method...');
    const isMatchMethod = await admin.comparePassword(password);
    console.log('   Result (model method):', isMatchMethod ? '✅ MATCH' : '❌ NO MATCH');
    console.log('\n');

    // Test password comparison directly with bcrypt
    console.log('Testing password comparison directly with bcrypt...');
    const isMatchDirect = await bcrypt.compare(password, admin.password);
    console.log('   Result (direct bcrypt):', isMatchDirect ? '✅ MATCH' : '❌ NO MATCH');
    console.log('\n');

    // Test with wrong password
    console.log('Testing with wrong password...');
    const isMatchWrong = await admin.comparePassword('wrongpassword');
    console.log('   Result (wrong password):', isMatchWrong ? '❌ SHOULD NOT MATCH' : '✅ Correctly rejected');
    console.log('\n');

    if (isMatchMethod && isMatchDirect) {
      console.log('🎉 Password verification is working correctly!');
      console.log('   The issue might be in the frontend or API request.');
    } else {
      console.log('⚠️  Password verification is NOT working!');
      console.log('   Need to reset the password again.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testAdminLogin();
