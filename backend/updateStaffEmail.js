const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp';

async function updateStaffEmail() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the staff member with the old email
    const staff = await Staff.findOne({ email: 'hemang@gtss.com' });
    
    if (!staff) {
      console.log('⚠️ Staff member with email hemang@gtss.com not found');
      
      // Check if the new email already exists
      const existingNew = await Staff.findOne({ email: 'hemangbhai@gtss.com' });
      if (existingNew) {
        console.log('✅ Staff member with email hemangbhai@gtss.com already exists');
        console.log(`Staff ID: ${existingNew.staffId}`);
        console.log(`Name: ${existingNew.name}`);
        console.log(`Role: ${existingNew.role}`);
      }
      
      await mongoose.connection.close();
      return;
    }

    // Update the email
    staff.email = 'hemangbhai@gtss.com';
    await staff.save();

    console.log('✅ Email updated successfully!');
    console.log('');
    console.log('📋 Updated Staff Details:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Staff ID: ${staff.staffId}`);
    console.log(`Name: ${staff.name}`);
    console.log(`Email: ${staff.email}`);
    console.log(`Password: GTSS@HB2024`);
    console.log(`Role: ${staff.role}`);
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error updating staff email:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

updateStaffEmail();
