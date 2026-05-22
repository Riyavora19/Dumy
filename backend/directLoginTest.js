const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function directLoginTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const email = 'admin@example.com';
    const password = 'admin123';

    console.log('Attempting to find admin with email:', email);
    
    // Find admin by email - exactly as the route does
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      console.log('\nLet me check what admins exist:');
      const allAdmins = await Admin.find({});
      console.log('Total admins:', allAdmins.length);
      allAdmins.forEach(a => {
        console.log(`  - Email: "${a.email}" (length: ${a.email.length})`);
        console.log(`    Name: ${a.name}`);
        console.log(`    Role: ${a.role}`);
        console.log(`    Active: ${a.isActive}`);
      });
      return;
    }

    console.log('✅ Admin found!');
    console.log('   Email:', admin.email);
    console.log('   Active:', admin.isActive);
    
    if (!admin.isActive) {
      console.log('❌ Admin is not active!');
      return;
    }

    console.log('\nTesting password comparison...');
    const isMatch = await admin.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password matches! Login should work.');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('   This is the problem - password verification is failing.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

directLoginTest();
