# Quotation Management Feature

## Overview
The Quotation Management feature allows admin users to create, manage, and generate professional quotations for clients. The feature includes a multi-step form, product selection, automatic calculations, and PDF generation.

## Components

### 1. AdminQuotations.jsx
**Main container component** that manages the quotation list and form display.

**Features:**
- Display list of all quotations
- Create new quotation
- Edit existing quotation
- Delete quotation
- Persist quotations to localStorage

**State Management:**
- `quotations`: Array of all quotations
- `showForm`: Boolean to toggle between list and form view
- `editingQuotation`: Current quotation being edited

**Key Methods:**
- `fetchQuotations()`: Load quotations from localStorage
- `handleSaveQuotation()`: Save or update quotation
- `handleDeleteQuotation()`: Delete quotation
- `handleEditQuotation()`: Load quotation for editing

---

### 2. QuotationForm.jsx
**Multi-step form component** for creating/editing quotations.

**Two-Step Process:**

#### Step 1: Client Details
- Client Name (required)
- Company Name (optional)
- Mobile Number (required)
- Email (required)
- Address (optional)

#### Step 2: Build Quotation
- Product selection from existing products
- Quantity and rate input
- Automatic amount calculation
- GST percentage input
- Summary display with totals

**Features:**
- Form validation
- Auto-calculation of amounts
- Product price auto-fill
- Edit client details option
- Save or Save & Generate PDF

**State Management:**
- `step`: Current form step ('client' or 'build')
- `clientData`: Client information
- `quotationItems`: Array of products in quotation
- `gst`: GST percentage
- `products`: Available products from API

---

### 3. ProductTable.jsx
**Reusable table component** for managing quotation items.

**Features:**
- Product dropdown with search
- Quantity input
- Rate input (editable or auto-filled)
- Auto-calculated amount
- Add/Remove row functionality
- Responsive table design

**Props:**
- `items`: Array of quotation items
- `products`: Available products
- `loading`: Loading state
- `onItemChange`: Callback for item changes
- `onRemoveRow`: Callback for row deletion
- `onAddRow`: Callback for adding new row

---

### 4. QuotationList.jsx
**Display component** for showing all quotations in a table.

**Features:**
- Sortable quotation list
- View quotation details
- Generate PDF
- Edit quotation
- Delete quotation
- Formatted dates and amounts

**Props:**
- `quotations`: Array of quotations
- `onEdit`: Callback for edit action
- `onDelete`: Callback for delete action

---

### 5. QuotationPDFGenerator.jsx
**PDF generation utility** using html2pdf library.

**Features:**
- Professional PDF layout
- Company header with details
- Client information section
- Product table with calculations
- Totals section with GST
- Terms and conditions
- Footer with generation timestamp

**PDF Includes:**
- Quotation number and date
- Validity period (30 days)
- Company details
- Client details
- Product list with amounts
- Subtotal, GST, and Total
- Terms & conditions
- Professional styling

---

## Data Structure

### Quotation Object
```javascript
{
  id: "unique-id",
  quotationNumber: "QT-1234567890",
  quotationDate: "2024-04-28",
  clientData: {
    clientName: "John Doe",
    companyName: "ABC Corp",
    mobileNumber: "+91 98765 43210",
    email: "john@example.com",
    address: "123 Business St, City"
  },
  items: [
    {
      id: 1,
      productId: "product-id",
      productName: "Product Name",
      quantity: 5,
      rate: 1000,
      amount: 5000
    }
  ],
  gst: 18,
  subtotal: 5000,
  gstAmount: 900,
  total: 5900,
  createdAt: "2024-04-28T10:30:00Z",
  updatedAt: "2024-04-28T10:30:00Z"
}
```

### Product Object (from API)
```javascript
{
  _id: "product-id",
  name: "Product Name",
  variant: "Variant Description",
  price: 1000,
  category: "category-id",
  company: "company-id",
  images: ["image-url"],
  sku: "SKU-123",
  stock: 100,
  isActive: true
}
```

---

## Usage Flow

### Creating a New Quotation

1. **Click "Create New Quotation"** button
2. **Fill Client Details:**
   - Enter client name, company, mobile, email, address
   - Click "Build Quotation"
3. **Add Products:**
   - Select products from dropdown
   - Enter quantity (auto-fills rate from product)
   - Amount auto-calculates
   - Click "Add Row" for more products
4. **Set GST and Review:**
   - Enter GST percentage
   - Review totals
5. **Save or Generate PDF:**
   - Click "Save Quotation" to save only
   - Click "Save & Generate PDF" to save and download PDF

### Editing a Quotation

1. Click **Edit** button on quotation row
2. Modify client details or products
3. Click "Build Quotation" to proceed
4. Make changes and save

### Generating PDF

1. Click **PDF icon** on quotation row, OR
2. Click "Save & Generate PDF" while creating/editing

---

## API Integration

### Fetch Products
```javascript
GET /api/products
```

**Response:**
```javascript
[
  {
    _id: "id",
    name: "Product Name",
    variant: "Variant",
    price: 1000,
    ...
  }
]
```

### Future Backend Integration

To persist quotations to backend instead of localStorage:

```javascript
// Save quotation
POST /api/quotations
Body: quotationData

// Update quotation
PUT /api/quotations/:id
Body: quotationData

// Delete quotation
DELETE /api/quotations/:id

// Get all quotations
GET /api/quotations

// Get single quotation
GET /api/quotations/:id
```

---

## Styling

### CSS Files
- `AdminQuotations.css`: Main container styling
- `QuotationForm.css`: Form and input styling
- `ProductTable.css`: Table styling
- `QuotationList.css`: List view styling

### Color Scheme
- **Primary Blue**: `#1e40af` (buttons, highlights)
- **Gradient Blue**: `#1e40af` to `#3b82f6` (primary buttons)
- **Dark Blue**: `#1e3a8a` (hover states)
- **Red**: `#dc3545` (delete buttons)
- **Light Gray**: `#f9f9f9` (backgrounds)
- **Border Gray**: `#e0e0e0` (borders)

---

## Features & Capabilities

✅ **Multi-step form** with validation
✅ **Product selection** from existing products
✅ **Auto-calculation** of amounts
✅ **GST support** with optional percentage
✅ **Professional PDF generation** with company details
✅ **CRUD operations** (Create, Read, Update, Delete)
✅ **Responsive design** for mobile and desktop
✅ **localStorage persistence** (can be upgraded to backend)
✅ **Edit existing quotations**
✅ **Delete quotations** with confirmation
✅ **Quotation number** auto-generation
✅ **Date tracking** for creation and updates

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

---

## Dependencies

- `react`: UI framework
- `react-router-dom`: Navigation
- `axios`: API calls
- `html2pdf.js`: PDF generation

---

## Future Enhancements

1. **Backend Integration**
   - Store quotations in MongoDB
   - Add user authentication
   - Track quotation status (Draft, Sent, Accepted, Rejected)

2. **Email Integration**
   - Send quotation via email
   - Email templates

3. **Advanced Features**
   - Quotation templates
   - Discount management
   - Payment terms
   - Recurring quotations
   - Quotation history/versioning

4. **Reporting**
   - Quotation analytics
   - Conversion tracking
   - Revenue forecasting

5. **Customization**
   - Custom company branding in PDF
   - Custom terms and conditions
   - Logo upload

---

## Troubleshooting

### PDF not generating
- Ensure `html2pdf.js` is installed: `npm install html2pdf.js`
- Check browser console for errors
- Verify quotation data is complete

### Products not loading
- Check API endpoint: `/api/products`
- Verify backend is running
- Check network tab in browser DevTools

### Quotations not persisting
- Check localStorage is enabled in browser
- Clear browser cache if issues persist
- Check browser console for errors

---

## Code Examples

### Adding a new quotation item
```javascript
const handleAddRow = () => {
  const newItem = {
    id: nextItemId,
    productId: '',
    productName: '',
    quantity: 1,
    rate: 0,
    amount: 0
  };
  setQuotationItems([...quotationItems, newItem]);
  setNextItemId(nextItemId + 1);
};
```

### Calculating totals
```javascript
const calculateTotals = () => {
  const subtotal = quotationItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const gstAmount = (subtotal * gst) / 100;
  const total = subtotal + gstAmount;
  return { subtotal, gstAmount, total };
};
```

### Generating PDF
```javascript
const handleGeneratePDF = () => {
  const quotationData = {
    clientData,
    items: quotationItems,
    gst,
    subtotal,
    gstAmount,
    total,
    quotationNumber: `QT-${Date.now()}`,
    quotationDate: new Date().toISOString().split('T')[0]
  };
  
  onSave(quotationData);
  setTimeout(() => {
    QuotationPDFGenerator(quotationData);
  }, 500);
};
```

---

## Support

For issues or questions, please refer to the component documentation or check the browser console for error messages.
