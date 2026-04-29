const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');
const Contact = require('./models/Contact');
const Order = require('./models/Order');
const Relationship = require('./models/Relationship');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const checkData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected\n');

    console.log('📊 DATABASE SUMMARY\n');
    console.log('='.repeat(50));

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const companyCount = await Company.countDocuments();
    const contactCount = await Contact.countDocuments();
    const orderCount = await Order.countDocuments();
    const relationshipCount = await Relationship.countDocuments();

    console.log(`\n📦 Products:        ${productCount}`);
    console.log(`📁 Categories:      ${categoryCount}`);
    console.log(`🏢 Companies:       ${companyCount}`);
    console.log(`👥 Contacts:        ${contactCount}`);
    console.log(`🛒 Orders:          ${orderCount}`);
    console.log(`🔗 Relationships:   ${relationshipCount}`);

    console.log('\n' + '='.repeat(50));

    if (productCount === 0) {
      console.log('\n⚠️  No products found!');
      console.log('   Run: node addSampleProducts.js');
    } else {
      console.log('\n✅ Products available');
      const products = await Product.find().limit(5).select('name price stock');
      console.log('\n   Sample products:');
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ₹${p.price} (Stock: ${p.stock})`);
      });
    }

    if (orderCount === 0) {
      console.log('\n⚠️  No orders found!');
      console.log('   Run: node seedOrdersData.js');
    } else {
      console.log('\n✅ Orders available');
      const orders = await Order.find().limit(3).select('orderNumber customerName total status');
      console.log('\n   Recent orders:');
      orders.forEach((o, i) => {
        console.log(`   ${i + 1}. ${o.orderNumber} - ${o.customerName} - ₹${o.total} (${o.status})`);
      });
    }

    if (contactCount === 0) {
      console.log('\n⚠️  No contacts found!');
      console.log('   Run: node seedOrdersData.js');
    } else {
      console.log('\n✅ Contacts available');
      const contacts = await Contact.find().limit(3).select('name contactType isReferrer');
      console.log('\n   Sample contacts:');
      contacts.forEach((c, i) => {
        const referrerTag = c.isReferrer ? ' (Referrer)' : '';
        console.log(`   ${i + 1}. ${c.name} - ${c.contactType}${referrerTag}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n💡 RECOMMENDATIONS:\n');

    if (productCount === 0 && orderCount === 0 && contactCount === 0) {
      console.log('   🚀 Run: node seedOrdersData.js');
      console.log('      (This will add everything: products, contacts, orders)');
    } else if (productCount === 0) {
      console.log('   📦 Run: node addSampleProducts.js');
      console.log('      (This will add 8 sample products)');
    } else if (orderCount === 0) {
      console.log('   🛒 Create orders through Admin Panel');
      console.log('      (Go to Orders → Create Order)');
    } else {
      console.log('   ✅ Your database is ready!');
      console.log('   🎉 You can start using the system');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    process.exit(1);
  }
};

checkData();
