/**
 * Script to create the first admin staff member
 * Run this once to set up your first admin account
 * 
 * Usage: node createFirstAdmin.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const Staff = require('./models/Staff');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createFirstAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if any admin exists
    const existingAdmin = await Staff.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  An admin account already exists:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Employee ID: ${existingAdmin.employeeId}\n`);
      
      const proceed = await question('Do you want to create another admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
      console.log('');
    }

    // Get admin details
    console.log('=== Create First Admin Account ===\n');
    
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const phone = await question('Enter admin phone (optional): ');

    // Validate inputs
    if (!name || !email || !password) {
      console.log('\n❌ Name, email, and password are required!');
      process.exit(1);
    }

    // Check if email already exists
    const existingEmail = await Staff.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('\n❌ This email is already registered!');
      process.exit(1);
    }

    // Create admin
    console.log('\nCreating admin account...');
    const admin = new Staff({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || undefined,
      role: 'admin',
      status: 'active'
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!\n');
    console.log('=== Admin Details ===');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Employee ID: ${admin.employeeId}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.status}`);
    console.log('\n=== Login Information ===');
    console.log(`Admin Panel: http://localhost:5173/admin/login`);
    console.log(`Staff Panel: http://localhost:5173/staff/login`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: [the password you entered]`);
    console.log('\n🎉 You can now login and start using the system!');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

// Run the script
createFirstAdmin();
