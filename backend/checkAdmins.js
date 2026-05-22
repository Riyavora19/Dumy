const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const admins = await Admin.find();
    
    console.log('📊 Total Admins:', admins.length);
    console.log('\n👤 Admin Accounts:\n');
    
    admins.forEach((admin, idx) => {
      console.log(`${idx + 1}. Email: ${admin.email}`);
      console.log(`   Name: ${admin.name || 'N/A'}`);
      console.log(`   Role: ${admin.role || 'admin'}`);
      console.log(`   Password Hash: ${admin.password ? 'EXISTS' : 'MISSING'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAdmins();
