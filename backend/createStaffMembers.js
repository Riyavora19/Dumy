const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss-db';

// Staff members to create
const staffMembers = [
  {
    staffId: 'GTSS/HB',
    name: 'Hemang Bhai',
    email: 'hemang@gtss.com',
    password: 'GTSS@HB2024',
    phone: '+91-9876543210',
    role: 'admin',
    status: 'active'
  },
  {
    staffId: 'GTSS/HH',
    name: 'Harshal Hemang Bhai',
    email: 'harshal@gtss.com',
    password: 'GTSS@HH2024',
    phone: '+91-9876543211',
    role: 'manager',
    status: 'active'
  },
  {
    staffId: 'GTSS/PB',
    name: 'Paras Bhai',
    email: 'paras@gtss.com',
    password: 'GTSS@PB2024',
    phone: '+91-9876543212',
    role: 'sales_staff',
    status: 'active'
  },
  {
    staffId: 'GTSS/DS',
    name: 'Dhaval Shah',
    email: 'dhaval@gtss.com',
    password: 'GTSS@DS2024',
    phone: '+91-9876543213',
    role: 'sales_staff',
    status: 'active'
  }
];

async function createStaffMembers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if staff members already exist
    for (const staffData of staffMembers) {
      const existingStaff = await Staff.findOne({ staffId: staffData.staffId });
      
      if (existingStaff) {
        console.log(`⚠️  Staff member ${staffData.staffId} (${staffData.name}) already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(staffData.password, salt);

      // Create staff member
      const staff = new Staff({
        ...staffData,
        password: hashedPassword
      });

      await staff.save();
      console.log(`✅ Created staff member: ${staffData.staffId} - ${staffData.name}`);
      console.log(`   Email: ${staffData.email}`);
      console.log(`   Password: ${staffData.password}`);
      console.log('');
    }

    console.log('✅ All staff members created successfully!');
    console.log('\n📋 Staff Login Credentials:');
    console.log('═══════════════════════════════════════════════════════════');
    staffMembers.forEach(staff => {
      console.log(`Staff ID: ${staff.staffId}`);
      console.log(`Name: ${staff.name}`);
      console.log(`Email: ${staff.email}`);
      console.log(`Password: ${staff.password}`);
      console.log(`Role: ${staff.role}`);
      console.log('───────────────────────────────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ Error creating staff members:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
createStaffMembers();
