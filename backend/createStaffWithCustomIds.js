const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');

const MONGODB_URI = 'mongodb://localhost:27017/mernapp';

const staffMembers = [
  {
    staffId: 'GTSS/HB',
    name: 'Hemangbhai',
    email: 'hemangbhai@gtss.com',
    password: 'gtss123',
    phone: '9876543210',
    role: 'admin',
    status: 'active'
  },
  {
    staffId: 'GTSS/HH',
    name: 'Harshal Hemangbhai',
    email: 'harshal@gtss.com',
    password: 'gtss123',
    phone: '9876543211',
    role: 'manager',
    status: 'active'
  },
  {
    staffId: 'GTSS/PB',
    name: 'Parasbhai',
    email: 'parasbhai@gtss.com',
    password: 'gtss123',
    phone: '9876543212',
    role: 'sales_staff',
    status: 'active'
  },
  {
    staffId: 'GTSS/DS',
    name: 'Dhaval Shah',
    email: 'dhavalshah@gtss.com',
    password: 'gtss123',
    phone: '9876543213',
    role: 'sales_staff',
    status: 'active'
  }
];

async function createStaff() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Full permissions for all staff
    const fullPermissions = {
      canCreateQuotation: true,
      canViewAllQuotations: true,
      canEditQuotation: true,
      canDeleteQuotation: true,
      canCreateOrder: true,
      canViewAllOrders: true,
      canEditOrder: true,
      canDeleteOrder: true,
      canManageProducts: true,
      canManageCategories: true,
      canViewInventory: true,
      canManageContacts: true,
      canViewAllContacts: true,
      canManageStaff: true,
      canManageSettings: true,
      canViewReports: true,
      canViewOwnReports: true
    };

    console.log('\n📝 Creating staff members...\n');

    for (const staffData of staffMembers) {
      // Check if staff already exists
      const existing = await Staff.findOne({ 
        $or: [
          { staffId: staffData.staffId },
          { email: staffData.email }
        ]
      });

      if (existing) {
        console.log(`⚠️  Staff ${staffData.staffId} (${staffData.name}) already exists - SKIPPING`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(staffData.password, salt);

      // Generate employee ID
      const count = await Staff.countDocuments();
      const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

      // Create staff
      const staff = new Staff({
        staffId: staffData.staffId,
        name: staffData.name,
        email: staffData.email,
        password: hashedPassword,
        phone: staffData.phone,
        role: staffData.role,
        status: staffData.status,
        permissions: fullPermissions,
        employeeId: employeeId
      });

      await staff.save();
      console.log(`✅ Created: ${staffData.staffId} - ${staffData.name}`);
      console.log(`   Email: ${staffData.email}`);
      console.log(`   Password: ${staffData.password}`);
      console.log(`   Employee ID: ${employeeId}`);
      console.log('');
    }

    console.log('\n✅ All staff members created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('                  STAFF LOGIN CREDENTIALS                ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    staffMembers.forEach(staff => {
      console.log(`👤 ${staff.name}`);
      console.log(`   Staff ID: ${staff.staffId}`);
      console.log(`   Email: ${staff.email}`);
      console.log(`   Password: ${staff.password}`);
      console.log(`   Role: ${staff.role}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n💡 Staff can login using either Staff ID or Email\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

createStaff();
