# 🚀 Quick Start Guide

## Step 1: Check Your Current Data

```bash
cd backend
node checkData.js
```

This will show you what's currently in your database.

---

## Step 2: Add Sample Data

### Option A: Add Everything (Recommended for Testing)
```bash
node seedOrdersData.js
```

**This adds:**
- ✅ 8 Products
- ✅ 3 Companies  
- ✅ 1 Category
- ✅ 5 Contacts (including referrers)
- ✅ 2 Relationships
- ✅ 4 Sample Orders

### Option B: Add Products Only
```bash
node addSampleProducts.js
```

**This adds:**
- ✅ 8 Products only

---

## Step 3: Start Your Servers

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

---

## Step 4: Access Admin Panel

Open browser: **http://localhost:5173/admin**

Login with your admin credentials.

---

## Step 5: Test the System

### View Products:
1. Click **"Products"** in sidebar
2. You should see 8 products listed

### View Orders:
1. Click **"Orders"** in sidebar
2. You should see 4 sample orders
3. Try filtering by status

### View Contacts:
1. Click **"Contacts & Network"** in sidebar
2. You should see 5 contacts
3. Click 👁️ to view details and relationships

### Create New Order:
1. Click **"Orders"** → **"+ Create Order"**
2. Follow the 5-step wizard:
   - **Step 1**: Customer details
   - **Step 2**: Referral info (optional)
   - **Step 3**: Select products ← **Products will show here now!**
   - **Step 4**: Addresses
   - **Step 5**: Review & submit

---

## 🎯 What You Can Do Now

### ✅ Order Management
- Create orders with referral tracking
- Select products from catalog
- Capture customer and referrer relationships
- Track commissions

### ✅ Contact Management
- Add contacts and referrers
- View relationship networks
- Track referral performance
- Manage commissions

### ✅ Product Management
- View product catalog
- Add/edit products
- Manage inventory
- Set pricing

---

## 📝 Sample Data Details

### Products Available:
1. Premium Toilet Seat - ₹8,500
2. Basin Mixer Tap - ₹4,500
3. Shower Panel - ₹15,000
4. Wall Hung Basin - ₹6,500
5. Mirror Cabinet - ₹12,000
6. Flush Tank - ₹5,500
7. Towel Rail - ₹2,500
8. Exhaust Fan - ₹3,500

### Sample Contacts:
- **Rajesh Kumar** (Architect, Referrer)
- **Priya Sharma** (Customer)
- **Amit Patel** (Contractor, Referrer)
- **Sneha Reddy** (Customer)
- **Vikram Singh** (Designer, Referrer)

### Sample Orders:
- Order with referral (Priya → Rajesh)
- Order with commission tracking
- Delivered order
- Processing order

---

## 🔧 Troubleshooting

### Products not showing in order form?

**Run this:**
```bash
cd backend
node checkData.js
```

If it shows "0 Products", run:
```bash
node addSampleProducts.js
```

### Can't connect to database?

**Check MongoDB is running:**
```bash
mongosh
```

If error, start MongoDB service.

### Backend not starting?

**Check if port 5000 is free:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

---

## 📞 Need Help?

1. Check `SETUP_INSTRUCTIONS.md` for detailed guide
2. Check `RELATIONSHIP_NETWORK_IMPLEMENTATION.md` for system overview
3. Run `node checkData.js` to see current state

---

## ✨ You're All Set!

Your relationship network system is ready to use with:
- ✅ Products in catalog
- ✅ Sample orders with referrals
- ✅ Contact network with relationships
- ✅ Commission tracking

**Start creating orders and managing your network!** 🎉
