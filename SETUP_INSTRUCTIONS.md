# Setup Instructions - Add Products & Sample Data

## Quick Start

### Option 1: Add Products Only (Fastest)

If you already have categories and companies in your database:

```bash
cd backend
node addSampleProducts.js
```

This will add **8 sample products** to your database.

---

### Option 2: Add Complete Sample Data (Recommended)

This adds products, contacts, relationships, and 4 sample orders:

```bash
cd backend
node seedOrdersData.js
```

This will create:
- ✅ 8 Products (bathroom fittings)
- ✅ 3 Companies (Kohler, Jaquar, Hindware)
- ✅ 1 Category (Bathroom Fittings)
- ✅ 5 Contacts (2 referrers, 3 customers)
- ✅ 2 Relationships (referral connections)
- ✅ 4 Sample Orders (with different statuses)

---

## Manual Product Addition (Through Admin Panel)

### Step 1: Login to Admin Panel
```
http://localhost:5173/admin
```

### Step 2: Add a Category (if needed)
1. Click "Categories" in sidebar
2. Click "+ Add Category"
3. Fill in:
   - Name: "Bathroom Fittings"
   - Description: "Complete bathroom products"
   - Status: Active
4. Click "Create"

### Step 3: Add a Company (if needed)
1. Click "Companies" in sidebar
2. Click "+ Add Company"
3. Fill in:
   - Name: "Kohler" (or any brand)
   - Description: "Premium bathroom products"
   - Status: Active
4. Click "Create"

### Step 4: Add Products
1. Click "Products" in sidebar
2. Click "+ Add Product"
3. Fill in product details:
   - **Name**: Premium Toilet Seat
   - **Category**: Select from dropdown
   - **Company**: Select from dropdown
   - **Variant**: White Ceramic
   - **Price**: 8500
   - **Original Price**: 10000
   - **Stock**: 50
   - **SKU**: PTS-001
   - **Description**: Soft-close premium toilet seat
   - **Status**: Active
4. Click "Create Product"

### Repeat for more products:

**Product 2:**
- Name: Basin Mixer Tap
- Variant: Chrome Finish
- Price: 4500
- Stock: 75
- SKU: BMT-002

**Product 3:**
- Name: Shower Panel
- Variant: Stainless Steel
- Price: 15000
- Stock: 30
- SKU: SP-003

**Product 4:**
- Name: Wall Hung Basin
- Variant: White Ceramic
- Price: 6500
- Stock: 40
- SKU: WHB-004

**Product 5:**
- Name: Mirror Cabinet
- Variant: LED Illuminated
- Price: 12000
- Stock: 25
- SKU: MC-005

---

## Creating Sample Orders

### Method 1: Using the Seed Script (Easiest)
```bash
cd backend
node seedOrdersData.js
```

### Method 2: Manual Order Creation

1. **Go to Orders Section**
   - Click "Orders" in admin sidebar
   - Click "+ Create Order"

2. **Step 1: Customer Details**
   - Enter customer name: "Priya Sharma"
   - Email: priya.sharma@example.com
   - Phone: 9876543211
   - Click "Next"

3. **Step 2: Referral Information**
   - Check "Was this customer referred by someone?"
   - Search for referrer: "Rajesh Kumar" (or create new)
   - Select relationship: "Architect/Designer"
   - Enter context: "Rajesh is designing Priya's new home"
   - Click "Next"

4. **Step 3: Select Products**
   - Click on products to add them
   - Adjust quantities
   - Click "Next"

5. **Step 4: Addresses**
   - Fill in shipping address
   - Check "Billing address same as shipping" (or fill separately)
   - Enter "Bill To" name if different
   - Click "Next"

6. **Step 5: Review & Submit**
   - Review all details
   - Select payment method
   - Add notes if needed
   - Click "Create Order"

---

## Verifying the Setup

### Check Products:
1. Go to Admin Panel → Products
2. You should see 8 products listed
3. Products should be searchable and selectable in order form

### Check Orders:
1. Go to Admin Panel → Orders
2. You should see 4 sample orders
3. Orders should show:
   - Customer names
   - Referrer information
   - Product counts
   - Total amounts
   - Status badges

### Check Contacts:
1. Go to Admin Panel → Contacts & Network
2. You should see 5 contacts
3. Some marked as "Referrers"
4. Click "View" to see relationships

### Check Dashboard:
1. Go to Admin Panel → Dashboard
2. Statistics should show:
   - Total Products: 8
   - Total Contacts: 5
   - Total Orders: 4
   - Recent orders listed

---

## Troubleshooting

### Products not showing in order form?

**Check 1: Products exist**
```bash
# In MongoDB shell or Compass
db.products.find().count()
```

**Check 2: Products are active**
```bash
db.products.find({ isActive: true }).count()
```

**Check 3: Backend is running**
```bash
cd backend
npm start
# Should show: Server running on port 5000
```

**Check 4: API is accessible**
```bash
curl http://localhost:5000/api/products
# Should return JSON with products
```

### Orders not creating?

**Check 1: All required fields filled**
- Customer name and phone are required
- At least one product must be selected
- Shipping address must be complete

**Check 2: Backend logs**
```bash
# Check terminal where backend is running
# Look for error messages
```

**Check 3: Browser console**
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
```

### Database connection issues?

**Check MongoDB is running:**
```bash
# For local MongoDB
mongosh
# Should connect successfully

# For MongoDB Atlas
# Check connection string in .env file
```

**Check .env file:**
```
MONGO_URI=mongodb://localhost:27017/mernapp
# or
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

## Sample Data Overview

### Products (8 items):
1. Premium Toilet Seat - ₹8,500
2. Basin Mixer Tap - ₹4,500
3. Shower Panel - ₹15,000
4. Wall Hung Basin - ₹6,500
5. Mirror Cabinet - ₹12,000
6. Flush Tank - ₹5,500
7. Towel Rail - ₹2,500
8. Exhaust Fan - ₹3,500

### Contacts (5 people):
1. **Rajesh Kumar** - Architect (Referrer, 5% commission)
2. **Priya Sharma** - Individual Customer
3. **Amit Patel** - Contractor (Referrer, 3% commission)
4. **Sneha Reddy** - Individual Customer
5. **Vikram Singh** - Designer (Referrer, 4% commission)

### Orders (4 orders):
1. **Order 1** - Priya Sharma (referred by Rajesh)
   - 3 products, Status: Pending
   
2. **Order 2** - Sneha Reddy (referred by Amit)
   - 2 products, Status: Confirmed, Payment: Paid
   
3. **Order 3** - Priya Sharma (referred by Rajesh)
   - 2 products, Status: Delivered, Payment: Paid
   
4. **Order 4** - Vikram Singh (no referrer)
   - 1 product, Status: Processing

---

## Next Steps

After adding products and sample data:

1. ✅ **Test Order Creation**
   - Create a new order through the form
   - Verify all steps work correctly
   - Check order appears in list

2. ✅ **Test Referral System**
   - Create order with referrer
   - Verify relationship is captured
   - Check commission is calculated

3. ✅ **Test Contact Management**
   - View contact details
   - See relationship network
   - Check order history

4. ✅ **Test Commission Workflow**
   - Approve pending commissions
   - Mark commissions as paid
   - Verify status updates

---

## Quick Commands Reference

```bash
# Add products only
cd backend && node addSampleProducts.js

# Add complete sample data
cd backend && node seedOrdersData.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Check MongoDB
mongosh
use mernapp
db.products.find().pretty()
db.orders.find().pretty()
db.contacts.find().pretty()
```

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all services are running (MongoDB, Backend, Frontend)
3. Check browser console for errors
4. Check backend terminal for error logs

---

**Setup Complete!** 🎉

Your system now has:
- ✅ Products ready for orders
- ✅ Sample contacts and referrers
- ✅ Example orders with relationships
- ✅ Working commission system

You can now create real orders and manage your relationship network!
