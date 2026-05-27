const mongoose = require('mongoose');
require('dotenv').config();

const ATLAS_URI = process.env.MONGO_URI;

async function checkAdmins() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get admins collection
    const adminsCollection = mongoose.connection.db.collection('admins');
    const admins = await adminsCollection.find({}).toArray();

    console.log('👥 Admin Accounts:\n');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email || admin.username}`);
      console.log(`   Username: ${admin.username || 'N/A'}`);
      console.log(`   Role: ${admin.role || 'admin'}`);
      console.log(`   ID: ${admin._id}`);
      console.log('');
    });

    // Get staff collection
    const staffCollection = mongoose.connection.db.collection('staffs');
    const staff = await staffCollection.find({}).toArray();

    console.log('👷 Staff Accounts:\n');
    staff.forEach((member, index) => {
      console.log(`${index + 1}. Email: ${member.email}`);
      console.log(`   Username: ${member.username || 'N/A'}`);
      console.log(`   Role: ${member.role || 'staff'}`);
      console.log(`   ID: ${member._id}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmins();
