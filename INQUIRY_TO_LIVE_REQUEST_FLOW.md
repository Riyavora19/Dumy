# 📋 Inquiry to Live Request Workflow

## 🎯 Complete Flow

```
User submits quote request
         ↓
    INQUIRIES
         ↓
Admin reviews inquiry
         ↓
Admin clicks "Convert to Live Request"
         ↓
   LIVE REQUESTS
         ↓
Admin views request & sends quotation
         ↓
Client receives quotation email
```

---

## 📝 Step-by-Step Process

### Step 1: User Submits Quote Request

**Location:** Website → Request Quote Page or Contact Page

**What happens:**
- User fills in contact form (name, email, phone, message)
- User can optionally select products they're interested in
- Form submits to backend
- Creates new **Inquiry** in database
- Status: "new"

**Files:**
- `frontend/src/pages/RequestQuote.jsx`
- `frontend/src/pages/Contact.jsx`
- `backend/routes/inquiries.js` (POST /)

---

### Step 2: Admin Views Inquiries

**Location:** Admin Panel → Inquiries Tab

**What admin sees:**
- List of all inquiries
- Filter by status: New, Read, Replied, Closed
- Each inquiry shows:
  - Date received
  - Client name
  - Email
  - Phone
  - Current status

**Actions available:**
- View details
- Update status
- Delete inquiry
- **Convert to Live Request** ⭐

**Files:**
- `frontend/src/components/AdminInquiries.jsx`

---

### Step 3: Admin Reviews Inquiry Details

**Location:** Admin Panel → Inquiries → Click "View" button

**Modal shows:**
- ✅ Contact information (name, email, phone)
- ✅ Date received
- ✅ Requested products (if any) with images
- ✅ Client message
- ✅ Status update buttons
- ✅ **Convert to Live Request button** (purple gradient)

**Files:**
- `frontend/src/components/AdminInquiries.jsx` (Detail Modal)

---

### Step 4: Convert to Live Request

**Location:** Inquiry Detail Modal → "Convert to Live Request" button

**What happens when clicked:**
1. Confirmation dialog appears
2. If confirmed:
   - Creates new **Live Request** with:
     - Auto-generated request number (REQ26040001)
     - Client info from inquiry
     - Request type: "quote"
     - Title: "Inquiry from [Client Name]"
     - Description: Inquiry message + requested products
     - Status: "new"
     - Source: "website"
     - Tag: "inquiry-conversion"
   - Updates inquiry status to "closed"
   - Shows success message with request number
   - Closes modal
   - Refreshes inquiry list

**Backend Route:**
```
POST /api/inquiries/:id/convert-to-live-request
```

**Files:**
- `backend/routes/inquiries.js` (convert route)
- `frontend/src/components/AdminInquiries.jsx` (convertToLiveRequest function)

---

### Step 5: Admin Manages Live Request

**Location:** Admin Panel → Live Requests Tab

**What admin sees:**
- Converted inquiry now appears as live request
- Request number: REQ26040001
- Client information
- Request details
- Status: "new"

**Actions available:**
- View request details
- Send quotation
- Edit request
- Delete request

**Files:**
- `frontend/src/components/AdminLiveRequests.jsx`

---

### Step 6: Admin Sends Quotation

**Location:** Live Requests → Click "View" → "Send Quotation to Client"

**Process:**
1. View request details
2. Click "Send Quotation to Client" button
3. Quotation form appears with:
   - Items table (can add/edit products)
   - Prices and quantities
   - Tax calculation
   - Terms and conditions
4. Fill in quotation details
5. Click "Send Quotation to Client"
6. System:
   - Saves quotation to database
   - Updates status to "quoted"
   - Sends professional email to client
   - Shows success message

**Files:**
- `frontend/src/components/AdminLiveRequests.jsx`
- `backend/routes/liveRequests.js`
- `backend/services/emailService.js`

---

## 🔄 Status Flow

### Inquiry Status
```
new → read → replied → closed (when converted)
```

### Live Request Status
```
new → quoted → approved → completed
```

---

## 📊 Data Structure

### Inquiry Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  message: String,
  products: [{
    productId: ObjectId,
    name: String,
    company: String,
    quantity: Number,
    image: String,
    sku: String
  }],
  status: 'new' | 'read' | 'replied' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

### Live Request Model (from Inquiry)
```javascript
{
  requestNumber: 'REQ26040001',
  clientName: inquiry.name,
  clientEmail: inquiry.email,
  clientPhone: inquiry.phone,
  requestType: 'quote',
  title: 'Inquiry from [Name]',
  description: inquiry.message + products list,
  urgency: 'medium',
  status: 'new',
  priority: 'medium',
  source: 'website',
  tags: ['inquiry-conversion'],
  notes: [{
    text: 'Converted from inquiry on [date]',
    addedBy: 'System'
  }]
}
```

---

## ✨ Features

### Inquiry Management
✅ View all inquiries in one place
✅ Filter by status
✅ See requested products with images
✅ Update status (new, read, replied, closed)
✅ Delete inquiries
✅ **Convert to live request with one click**

### Live Request Management
✅ Auto-generated request numbers
✅ Complete client information
✅ Product details from inquiry
✅ Send professional quotations
✅ Email notifications
✅ Status tracking

---

## 🎨 UI Elements

### Inquiry Detail Modal
- **Contact Information** section
- **Requested Products** section (with images)
- **Status Update** buttons
- **Message** section
- **Convert to Live Request** button (purple gradient)
- **Delete** and **Close** buttons

### Live Request Modal
- **Request Details** section
- **Client Information** section
- **Description** section
- **Send Quotation** button
- **Quotation Form** (toggleable)
- **Edit Request** button

---

## 🔧 Backend Routes

### Inquiries
```
POST   /api/inquiries                              - Create inquiry (public)
GET    /api/inquiries                              - Get all inquiries (admin)
GET    /api/inquiries/:id                          - Get single inquiry (admin)
PATCH  /api/inquiries/:id/status                   - Update status (admin)
DELETE /api/inquiries/:id                          - Delete inquiry (admin)
POST   /api/inquiries/:id/convert-to-live-request  - Convert to live request (admin) ⭐
```

### Live Requests
```
GET    /api/live-requests                          - Get all live requests
GET    /api/live-requests/:id                      - Get single live request
POST   /api/live-requests                          - Create live request
PUT    /api/live-requests/:id                      - Update live request
DELETE /api/live-requests/:id                      - Delete live request
POST   /api/live-requests/:id/send-quotation-email - Send quotation email
```

---

## 📋 Testing Checklist

### Test Inquiry to Live Request Conversion
- [ ] User submits quote request from website
- [ ] Inquiry appears in admin panel
- [ ] Admin can view inquiry details
- [ ] Admin can see requested products
- [ ] Admin clicks "Convert to Live Request"
- [ ] Confirmation dialog appears
- [ ] Live request is created with correct data
- [ ] Inquiry status updates to "closed"
- [ ] Success message shows request number
- [ ] Live request appears in Live Requests tab
- [ ] Admin can view and send quotation

### Test Edge Cases
- [ ] Convert inquiry without phone number
- [ ] Convert inquiry without products
- [ ] Convert inquiry with multiple products
- [ ] Try to convert already closed inquiry
- [ ] Delete inquiry after conversion

---

## 🚀 Benefits

1. **Organized Workflow** - Clear separation between inquiries and active requests
2. **No Data Loss** - All inquiry information transfers to live request
3. **Easy Tracking** - Know which requests came from inquiries
4. **One-Click Conversion** - Fast and efficient
5. **Automatic Status Updates** - Inquiry closes when converted
6. **Request Numbering** - Professional tracking system

---

## 💡 Usage Tips

1. **Review inquiries daily** - Check for new inquiries regularly
2. **Update status** - Mark as "read" when reviewed
3. **Convert qualified leads** - Convert serious inquiries to live requests
4. **Keep inquiries clean** - Delete spam or irrelevant inquiries
5. **Use filters** - Filter by status to focus on new inquiries

---

Last Updated: April 25, 2026
