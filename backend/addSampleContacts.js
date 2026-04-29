const mongoose = require('mongoose');
const Contact = require('./models/Contact');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const addContacts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected...');

    // Sample contacts
    const contacts = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '9876543210',
        contactType: 'architect',
        isReferrer: true,
        commissionRate: 5,
        commissionType: 'percentage',
        status: 'active',
        companyName: 'RK Architects',
        designation: 'Principal Architect'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '9876543212',
        contactType: 'contractor',
        isReferrer: true,
        commissionRate: 3,
        commissionType: 'percentage',
        status: 'active',
        companyName: 'AP Constructions',
        designation: 'Managing Director'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '9876543214',
        contactType: 'designer',
        isReferrer: true,
        commissionRate: 4,
        commissionType: 'percentage',
        status: 'active',
        companyName: 'VS Interiors',
        designation: 'Lead Designer'
      }
    ];

    const created = await Contact.insertMany(contacts);
    console.log(`\n✅ Successfully added ${created.length} contacts!`);
    
    console.log('\nContacts added (can be used as referrers):');
    created.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} - ${c.contactType} (${c.commissionRate}% commission)`);
    });

    console.log('\n💡 Now you can:');
    console.log('   1. Go back to the order form');
    console.log('   2. Search for these names in the referrer field');
    console.log('   3. Select relationship type');
    console.log('   4. Continue to products\n');

    process.exit(0);
  } catch (error) {
    console.error('Error adding contacts:', error);
    process.exit(1);
  }
};

addContacts();
