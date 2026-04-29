const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Relationship = require('./models/Relationship');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    console.log('Clearing existing orders, contacts, and relationships...');
    await Order.deleteMany({});
    await Relationship.deleteMany({});
    await Contact.deleteMany({});

    // Create sample categories if they don't exist
    let category = await Category.findOne({ name: 'Bathroom Fittings' });
    if (!category) {
      category = await Category.create({
        name: 'Bathroom Fittings',
        description: 'Complete bathroom fittings and accessories',
        isActive: true
      });
      console.log('Created category: Bathroom Fittings');
    }

    // Create sample companies if they don't exist
    let company1 = await Company.findOne({ name: 'Kohler' });
    if (!company1) {
      company1 = await Company.create({
        name: 'Kohler',
        description: 'Premium bathroom and kitchen products',
        isActive: true,
        isPartner: true
      });
      console.log('Created company: Kohler');
    }

    let company2 = await Company.findOne({ name: 'Jaquar' });
    if (!company2) {
      company2 = await Company.create({
        name: 'Jaquar',
        description: 'Luxury bathroom solutions',
        isActive: true,
        isPartner: true
      });
      console.log('Created company: Jaquar');
    }

    let company3 = await Company.findOne({ name: 'Hindware' });
    if (!company3) {
      company3 = await Company.create({
        name: 'Hindware',
        description: 'Quality bathroom products',
        isActive: true,
        isPartner: true
      });
      console.log('Created company: Hindware');
    }

    // Create sample products
    console.log('Creating sample products...');
    
    const products = [
      {
        name: 'Premium Toilet Seat',
        description: 'Soft-close premium toilet seat with quick-release hinges',
        category: category._id,
        company: company1._id,
        companyName: 'Kohler',
        variant: 'White Ceramic',
        price: 8500,
        originalPrice: 10000,
        discount: 15,
        images: ['/uploads/toilet-seat.jpg'],
        sku: 'KOH-TS-001',
        stock: 50,
        specifications: {
          material: 'Ceramic',
          color: 'White',
          warranty: '2 years',
          features: ['Soft-close', 'Quick-release', 'Anti-bacterial coating']
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 120
      },
      {
        name: 'Basin Mixer Tap',
        description: 'Single lever basin mixer with aerator',
        category: category._id,
        company: company2._id,
        companyName: 'Jaquar',
        variant: 'Chrome Finish',
        price: 4500,
        originalPrice: 5500,
        discount: 18,
        images: ['/uploads/basin-tap.jpg'],
        sku: 'JAQ-BT-002',
        stock: 75,
        specifications: {
          material: 'Brass',
          color: 'Chrome',
          warranty: '5 years',
          features: ['Water-saving aerator', 'Single lever', 'Easy installation']
        },
        isActive: true,
        rating: 4.7,
        reviewCount: 85
      },
      {
        name: 'Shower Panel',
        description: 'Stainless steel shower panel with rain shower and hand shower',
        category: category._id,
        company: company2._id,
        companyName: 'Jaquar',
        variant: 'Stainless Steel',
        price: 15000,
        originalPrice: 18000,
        discount: 17,
        images: ['/uploads/shower-panel.jpg'],
        sku: 'JAQ-SP-003',
        stock: 30,
        specifications: {
          material: 'Stainless Steel',
          color: 'Silver',
          warranty: '3 years',
          features: ['Rain shower', 'Hand shower', 'Body jets', 'Temperature control']
        },
        isActive: true,
        rating: 4.8,
        reviewCount: 65
      },
      {
        name: 'Wall Hung Basin',
        description: 'Modern wall-mounted ceramic basin',
        category: category._id,
        company: company3._id,
        companyName: 'Hindware',
        variant: 'White Ceramic',
        price: 6500,
        originalPrice: 7500,
        discount: 13,
        images: ['/uploads/basin.jpg'],
        sku: 'HIN-WB-004',
        stock: 40,
        specifications: {
          material: 'Ceramic',
          size: '550mm x 450mm',
          color: 'White',
          warranty: '2 years',
          features: ['Wall-mounted', 'Space-saving', 'Easy to clean']
        },
        isActive: true,
        rating: 4.4,
        reviewCount: 95
      },
      {
        name: 'Bathroom Mirror Cabinet',
        description: 'LED mirror cabinet with storage',
        category: category._id,
        company: company1._id,
        companyName: 'Kohler',
        variant: 'LED Illuminated',
        price: 12000,
        originalPrice: 14000,
        discount: 14,
        images: ['/uploads/mirror-cabinet.jpg'],
        sku: 'KOH-MC-005',
        stock: 25,
        specifications: {
          material: 'Glass & Aluminum',
          size: '600mm x 700mm',
          color: 'Silver',
          warranty: '1 year',
          features: ['LED lighting', 'Storage shelves', 'Anti-fog', 'Touch sensor']
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 55
      },
      {
        name: 'Flush Tank',
        description: 'Dual flush concealed cistern',
        category: category._id,
        company: company3._id,
        companyName: 'Hindware',
        variant: 'Dual Flush',
        price: 5500,
        originalPrice: 6500,
        discount: 15,
        images: ['/uploads/flush-tank.jpg'],
        sku: 'HIN-FT-006',
        stock: 60,
        specifications: {
          material: 'Plastic',
          color: 'White',
          warranty: '3 years',
          features: ['Dual flush', 'Water-saving', 'Easy maintenance']
        },
        isActive: true,
        rating: 4.3,
        reviewCount: 110
      },
      {
        name: 'Towel Rail',
        description: 'Stainless steel towel rail',
        category: category._id,
        company: company2._id,
        companyName: 'Jaquar',
        variant: 'Chrome Finish',
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        images: ['/uploads/towel-rail.jpg'],
        sku: 'JAQ-TR-007',
        stock: 100,
        specifications: {
          material: 'Stainless Steel',
          size: '600mm',
          color: 'Chrome',
          warranty: '5 years',
          features: ['Rust-resistant', 'Easy installation', 'Modern design']
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 75
      },
      {
        name: 'Bathroom Exhaust Fan',
        description: 'Silent operation exhaust fan',
        category: category._id,
        company: company3._id,
        companyName: 'Hindware',
        variant: 'White',
        price: 3500,
        originalPrice: 4000,
        discount: 13,
        images: ['/uploads/exhaust-fan.jpg'],
        sku: 'HIN-EF-008',
        stock: 80,
        specifications: {
          material: 'Plastic & Metal',
          size: '200mm',
          color: 'White',
          warranty: '2 years',
          features: ['Silent operation', 'Energy efficient', 'Auto shut-off']
        },
        isActive: true,
        rating: 4.2,
        reviewCount: 90
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Create sample contacts
    console.log('Creating sample contacts...');
    
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
        address: {
          street: '123 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        },
        companyName: 'RK Architects',
        designation: 'Principal Architect'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '9876543211',
        contactType: 'individual',
        isReferrer: false,
        status: 'active',
        address: {
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        }
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
        address: {
          street: '789 Residency Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        },
        companyName: 'AP Constructions',
        designation: 'Managing Director'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '9876543213',
        contactType: 'individual',
        isReferrer: false,
        status: 'active',
        address: {
          street: '321 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India'
        }
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
        address: {
          street: '654 Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          country: 'India'
        },
        companyName: 'VS Interiors',
        designation: 'Lead Designer'
      }
    ];

    const createdContacts = await Contact.insertMany(contacts);
    console.log(`Created ${createdContacts.length} contacts`);

    // Create relationships
    console.log('Creating sample relationships...');
    
    const relationships = [
      {
        contactA: createdContacts[1]._id, // Priya
        contactB: createdContacts[0]._id, // Rajesh (architect)
        relationshipTypeAtoB: 'referred-by',
        relationshipTypeBtoA: 'architect',
        context: 'Rajesh is designing Priya\'s new home',
        howTheyMet: 'Referred by a mutual friend',
        isReferralRelationship: true,
        isPrimaryReferral: true,
        referrer: createdContacts[0]._id,
        referred: createdContacts[1]._id,
        referralDate: new Date(),
        status: 'active',
        verifiedByAdmin: true
      },
      {
        contactA: createdContacts[3]._id, // Sneha
        contactB: createdContacts[2]._id, // Amit (contractor)
        relationshipTypeAtoB: 'referred-by',
        relationshipTypeBtoA: 'contractor',
        context: 'Amit is renovating Sneha\'s bathroom',
        howTheyMet: 'Amit worked on Sneha\'s neighbor\'s project',
        isReferralRelationship: true,
        isPrimaryReferral: true,
        referrer: createdContacts[2]._id,
        referred: createdContacts[3]._id,
        referralDate: new Date(),
        status: 'active',
        verifiedByAdmin: true
      }
    ];

    const createdRelationships = await Relationship.insertMany(relationships);
    console.log(`Created ${createdRelationships.length} relationships`);

    // Create sample orders
    console.log('Creating sample orders...');
    
    const orders = [
      {
        customer: createdContacts[1]._id,
        customerName: 'Priya Sharma',
        customerEmail: 'priya.sharma@example.com',
        customerPhone: '9876543211',
        referrer: createdContacts[0]._id,
        referrerName: 'Rajesh Kumar',
        relationship: createdRelationships[0]._id,
        relationshipType: 'architect',
        relationshipContext: 'Rajesh is designing Priya\'s new home',
        products: [
          {
            product: createdProducts[0]._id,
            productName: createdProducts[0].name,
            sku: createdProducts[0].sku,
            company: createdProducts[0].company,
            companyName: createdProducts[0].companyName,
            category: createdProducts[0].category,
            quantity: 2,
            unitPrice: createdProducts[0].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[0].price * 2,
            image: createdProducts[0].images[0]
          },
          {
            product: createdProducts[1]._id,
            productName: createdProducts[1].name,
            sku: createdProducts[1].sku,
            company: createdProducts[1].company,
            companyName: createdProducts[1].companyName,
            category: createdProducts[1].category,
            quantity: 3,
            unitPrice: createdProducts[1].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[1].price * 3,
            image: createdProducts[1].images[0]
          },
          {
            product: createdProducts[2]._id,
            productName: createdProducts[2].name,
            sku: createdProducts[2].sku,
            company: createdProducts[2].company,
            companyName: createdProducts[2].companyName,
            category: createdProducts[2].category,
            quantity: 1,
            unitPrice: createdProducts[2].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[2].price * 1,
            image: createdProducts[2].images[0]
          }
        ],
        shippingAddress: {
          name: 'Priya Sharma',
          phone: '9876543211',
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        },
        billingAddress: {
          name: 'Priya Sharma',
          phone: '9876543211',
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        },
        sameAsShipping: true,
        billToName: 'Priya Sharma',
        discountType: 'none',
        taxRate: 18,
        shippingCharges: 500,
        paymentMethod: 'pending',
        paymentStatus: 'pending',
        status: 'pending',
        notes: 'Please deliver between 10 AM - 5 PM',
        source: 'admin',
        createdBy: 'admin',
        orderDate: new Date()
      },
      {
        customer: createdContacts[3]._id,
        customerName: 'Sneha Reddy',
        customerEmail: 'sneha.reddy@example.com',
        customerPhone: '9876543213',
        referrer: createdContacts[2]._id,
        referrerName: 'Amit Patel',
        relationship: createdRelationships[1]._id,
        relationshipType: 'contractor',
        relationshipContext: 'Amit is renovating Sneha\'s bathroom',
        products: [
          {
            product: createdProducts[3]._id,
            productName: createdProducts[3].name,
            sku: createdProducts[3].sku,
            company: createdProducts[3].company,
            companyName: createdProducts[3].companyName,
            category: createdProducts[3].category,
            quantity: 1,
            unitPrice: createdProducts[3].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[3].price * 1,
            image: createdProducts[3].images[0]
          },
          {
            product: createdProducts[4]._id,
            productName: createdProducts[4].name,
            sku: createdProducts[4].sku,
            company: createdProducts[4].company,
            companyName: createdProducts[4].companyName,
            category: createdProducts[4].category,
            quantity: 1,
            unitPrice: createdProducts[4].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[4].price * 1,
            image: createdProducts[4].images[0]
          }
        ],
        shippingAddress: {
          name: 'Sneha Reddy',
          phone: '9876543213',
          street: '321 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India'
        },
        billingAddress: {
          name: 'Sneha Reddy',
          phone: '9876543213',
          street: '321 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India'
        },
        sameAsShipping: true,
        billToName: 'Sneha Reddy',
        discountType: 'percentage',
        discount: 10,
        taxRate: 18,
        shippingCharges: 300,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        status: 'confirmed',
        notes: 'Urgent delivery required',
        source: 'admin',
        createdBy: 'admin',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        customer: createdContacts[1]._id,
        customerName: 'Priya Sharma',
        customerEmail: 'priya.sharma@example.com',
        customerPhone: '9876543211',
        referrer: createdContacts[0]._id,
        referrerName: 'Rajesh Kumar',
        relationship: createdRelationships[0]._id,
        relationshipType: 'architect',
        relationshipContext: 'Additional items for Priya\'s home',
        products: [
          {
            product: createdProducts[5]._id,
            productName: createdProducts[5].name,
            sku: createdProducts[5].sku,
            company: createdProducts[5].company,
            companyName: createdProducts[5].companyName,
            category: createdProducts[5].category,
            quantity: 2,
            unitPrice: createdProducts[5].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[5].price * 2,
            image: createdProducts[5].images[0]
          },
          {
            product: createdProducts[6]._id,
            productName: createdProducts[6].name,
            sku: createdProducts[6].sku,
            company: createdProducts[6].company,
            companyName: createdProducts[6].companyName,
            category: createdProducts[6].category,
            quantity: 4,
            unitPrice: createdProducts[6].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[6].price * 4,
            image: createdProducts[6].images[0]
          }
        ],
        shippingAddress: {
          name: 'Priya Sharma',
          phone: '9876543211',
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        },
        billingAddress: {
          name: 'Priya Sharma',
          phone: '9876543211',
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560025',
          country: 'India'
        },
        sameAsShipping: true,
        billToName: 'Priya Sharma',
        discountType: 'none',
        taxRate: 18,
        shippingCharges: 400,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        status: 'delivered',
        notes: '',
        source: 'admin',
        createdBy: 'admin',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        deliveredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        customer: createdContacts[4]._id,
        customerName: 'Vikram Singh',
        customerEmail: 'vikram.singh@example.com',
        customerPhone: '9876543214',
        products: [
          {
            product: createdProducts[7]._id,
            productName: createdProducts[7].name,
            sku: createdProducts[7].sku,
            company: createdProducts[7].company,
            companyName: createdProducts[7].companyName,
            category: createdProducts[7].category,
            quantity: 3,
            unitPrice: createdProducts[7].price,
            discount: 0,
            tax: 0,
            totalPrice: createdProducts[7].price * 3,
            image: createdProducts[7].images[0]
          }
        ],
        shippingAddress: {
          name: 'Vikram Singh',
          phone: '9876543214',
          street: '654 Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          country: 'India'
        },
        billingAddress: {
          name: 'VS Interiors',
          phone: '9876543214',
          street: '654 Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          country: 'India'
        },
        sameAsShipping: false,
        billToName: 'VS Interiors',
        discountType: 'flat',
        discount: 500,
        taxRate: 18,
        shippingCharges: 200,
        paymentMethod: 'bank-transfer',
        paymentStatus: 'pending',
        status: 'processing',
        notes: 'Company purchase',
        source: 'admin',
        createdBy: 'admin',
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Save orders one by one to trigger pre-save hooks
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save();
      console.log(`Created order: ${order.orderNumber}`);
      
      // Update contact statistics
      await Contact.findByIdAndUpdate(order.customer, {
        $inc: { 
          totalOrders: 1,
          totalRevenue: order.total
        }
      });
      
      if (order.referrer) {
        await Contact.findByIdAndUpdate(order.referrer, {
          $inc: { 
            totalRevenue: order.total,
            totalCommissionEarned: order.referrerCommission.amount
          }
        });
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Contacts: ${createdContacts.length}`);
    console.log(`- Relationships: ${createdRelationships.length}`);
    console.log(`- Orders: ${orders.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
