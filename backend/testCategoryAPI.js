require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isActive: Boolean,
  price: Number
});

const categorySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean
});

const companySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean
});

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Company = mongoose.model('Company', companySchema);

async function testCategoryAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    // Get all active categories
    const categories = await Category.find({ isActive: true });
    console.log(`📊 Active Categories: ${categories.length}\n`);

    for (const category of categories) {
      console.log(`\n🏷️  Category: ${category.name} (ID: ${category._id})`);
      
      // Count products in this category
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true
      });
      
      console.log(`   Products: ${productCount}`);
      
      if (productCount > 0) {
        // Get sample products
        const sampleProducts = await Product.find({
          category: category._id,
          isActive: true
        })
        .populate('company', 'name')
        .limit(3);
        
        console.log(`   Sample products:`);
        sampleProducts.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} - Company: ${p.company?.name || 'N/A'}`);
        });
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCategoryAPI();
