require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateCategoryIcons() {
  try {
    // Update Faucet category
    await Category.findOneAndUpdate(
      { name: 'Faucet' },
      { 
        icon: '🚰',
        color: '#3b82f6'
      }
    );
    console.log('✅ Updated Faucet category icon');

    // Update Accessories category
    await Category.findOneAndUpdate(
      { name: 'Accessories' },
      { 
        icon: '🔧',
        color: '#10b981'
      }
    );
    console.log('✅ Updated Accessories category icon');

    // Update Tiles category
    await Category.findOneAndUpdate(
      { name: 'Tiles' },
      { 
        icon: '🏺',
        color: '#f59e0b'
      }
    );
    console.log('✅ Updated Tiles category icon');

    console.log('\n✅ All category icons updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating category icons:', error);
    process.exit(1);
  }
}

updateCategoryIcons();
