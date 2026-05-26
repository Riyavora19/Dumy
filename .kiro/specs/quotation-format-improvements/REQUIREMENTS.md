# Quotation Format Improvements - Requirements

## 📋 Overview
This spec documents ideas and improvements for the quotation system, focusing on pricing display formats, discount handling, and user experience enhancements.

---

## 🎯 Current State

### Existing Quotation Formats
The system currently supports **6 quotation formats**:

1. **Format 1**: `SR | AREA | IMAGE | QTY | MRP | YOUR PRICE | TOTAL`
   - Shows original MRP and custom price
   - Allows direct price editing
   - Good for showing exact prices to clients

2. **Format 2** (default): `SR | AREA | IMAGE | QTY | MRP | DISCOUNT | TOTAL`
   - Shows original MRP and discount percentage
   - Calculates final price from discount
   - Good for showing savings/offers

3. **Format 3**: `SR | AREA | IMAGE | QTY | MRP | DISC% | FINAL PRICE | TOTAL`
   - Shows MRP, discount percentage, and final discounted price
   - Most transparent for showing both discount and final price
   - Good for detailed price breakdown

4. **Format 4**: `SR | AREA | IMAGE | QTY | MRP | TOTAL` (with GST breakdown in subtotal)
   - Shows only MRP per product
   - GST breakdown shown in subtotal section
   - Taxable Amount and GST @18% calculated using reverse GST formula
   - Good for clean product listing with tax details at bottom

5. **Format 5**: `SR | AREA | IMAGE | QTY | MRP | YOUR PRICE | TOTAL` (with GST breakdown)
   - Shows MRP and custom price per product
   - GST breakdown shown in subtotal section
   - Combines Format 1 with GST transparency
   - Good for custom pricing with tax details

6. **Format 6**: `SR | AREA | IMAGE | QTY | MRP | DISC% | YOUR PRICE | TOTAL` (with GST breakdown)
   - Complete breakdown: MRP, discount%, final price, and total
   - GST breakdown shown in subtotal section
   - Most comprehensive format
   - Good for maximum transparency

### Current Features
- ✅ Products organized by bathroom/room and area
- ✅ Editable prices/discounts when "Edit Prices" is enabled
- ✅ PDF generation with selected format
- ✅ SUBTOTAL display at bottom
- ✅ Format switching in preview
- ✅ **GST breakdown in subtotal** (Formats 4, 5, 6)
- ✅ **Reverse GST calculation** (MRP includes GST)

---

## 💡 New Ideas & Requirements

### 1. **Pricing & Discount Management**

#### 1.1 Remove Discount from Product Details
**Current Issue**: Discount is shown in product details on the website frontend
**Proposed Change**: 
- Remove discount display from product listing pages
- Remove discount input from "Add Product" form
- Keep only ONE price field: **Original Price (MRP)**
- Discount should ONLY be added from quotation/order creation

**Rationale**: 
- Cleaner product management
- Centralized discount control
- Prevents confusion between product-level and quotation-level discounts

#### 1.2 Default "Your Price" Behavior
**Requirement**: 
- In Format 1, "YOUR PRICE" should default to MRP
- Price should remain equal to MRP until admin manually changes it
- No automatic discount application

**Implementation Notes**:
- When product is added to quotation, set `yourPrice = mrp`
- Only change when admin explicitly edits the price
- Clear visual indication when price differs from MRP

---

### 2. **GitHub Push Control**

**Requirement**: Do not automatically push code to GitHub after every change

**Implementation**:
- Manual git push only when explicitly requested
- No automatic commits/pushes in development workflow
- User will trigger push when ready

---

## 🔮 Additional Ideas & Enhancements

### 3. **Format Enhancements**

#### 3.1 Format 3: Detailed Breakdown
**Proposed Format**: `SR | AREA | IMAGE | QTY | MRP | DISCOUNT% | DISCOUNTED PRICE | TOTAL`
- Shows both discount percentage AND final price
- Most transparent for clients
- Helps clients understand exact savings

#### 3.2 Format 4: Minimal Format
**Proposed Format**: `SR | IMAGE | PRODUCT | QTY | PRICE | TOTAL`
- Simplified view without area grouping
- Good for simple quotations
- Faster to read

#### 3.3 Format 5: Company-wise Grouping
**Proposed Format**: Group products by company/brand
- Organize by manufacturer (Kohler, Jaguar, etc.)
- Show company logos
- Subtotals per company
- Useful for multi-brand projects

---

### 4. **Pricing Features**

#### 4.1 Bulk Discount Application
**Feature**: Apply discount to multiple products at once
- Select multiple products
- Apply same discount % to all
- Apply discount to entire area/room
- Apply company-specific discounts automatically

#### 4.2 Discount Presets
**Feature**: Save and reuse discount configurations
- Create discount templates (e.g., "VIP Client - 15%", "Bulk Order - 20%")
- Apply preset to entire quotation
- Company-specific discount rules

#### 4.3 Price History
**Feature**: Track price changes in quotation
- Show when prices were edited
- Who made the changes
- Original vs current price comparison

---

### 5. **Visual Enhancements**

#### 5.1 Price Comparison Highlighting
- Highlight products with discounts in green
- Show savings amount in currency
- Visual indicator for "best deals"

#### 5.2 Product Images in PDF
- Ensure high-quality images in PDF
- Option to show/hide images
- Multiple images per product (gallery view)

#### 5.3 Company Branding
- Add company logos next to products
- Brand-wise color coding
- Professional header/footer in PDF

---

### 6. **Quotation Management**

#### 6.1 Quotation Versions
**Feature**: Track quotation revisions
- Save multiple versions of same quotation
- Compare versions side-by-side
- Revert to previous version
- Version history with timestamps

#### 6.2 Quotation Templates
**Feature**: Save quotations as templates
- Reuse common product combinations
- Template library for different room types
- Quick quotation generation

#### 6.3 Client-Specific Pricing
**Feature**: Remember client preferences
- Auto-apply client's usual discount
- Client price history
- Preferred products per client

---

### 7. **Export & Sharing**

#### 7.1 Multiple Export Formats
- PDF (current)
- Excel/CSV for client's procurement team
- WhatsApp-friendly format (images + text)
- Email template with embedded preview

#### 7.2 Quotation Link Sharing
- Generate shareable link
- Client can view online without download
- Track when client views quotation
- Client can accept/reject online

---

### 8. **Calculation Features**

#### 8.1 Tax Management
- Add GST/tax calculations
- Show tax breakdown
- Support different tax rates per product category

#### 8.2 Additional Charges
- Installation charges
- Delivery charges
- Handling fees
- Custom line items

#### 8.3 Payment Terms Display
- Show payment schedule
- Milestone-based payments
- Advance/balance breakdown

---

### 9. **Smart Features**

#### 9.1 Price Validation
- Warn if discount exceeds threshold (e.g., >30%)
- Alert if price is below cost
- Minimum margin warnings

#### 9.2 Competitor Comparison
- Compare prices with market rates
- Show if pricing is competitive
- Suggest optimal pricing

#### 9.3 Profit Margin Display
- Show margin % per product
- Overall quotation margin
- Target margin vs actual

---

### 10. **User Experience**

#### 10.1 Quick Edit Mode
- Inline editing without modal
- Keyboard shortcuts for faster editing
- Bulk operations (delete, duplicate)

#### 10.2 Search & Filter in Quotation
- Search products within quotation
- Filter by area/room
- Sort by price, discount, company

#### 10.3 Notes & Comments
- Add internal notes per product
- Client-facing notes
- Special instructions per item

---

## 🎨 UI/UX Improvements

### 11. **Preview Enhancements**

#### 11.1 Live Preview
- Real-time preview while editing
- Side-by-side edit and preview
- Mobile preview mode

#### 11.2 Print Optimization
- Print-friendly layout
- Page break control
- Header/footer customization

#### 11.3 Branding Customization
- Upload company logo
- Custom color scheme
- Personalized footer text

---

## 📊 Analytics & Reporting

### 12. **Quotation Analytics**

#### 12.1 Conversion Tracking
- Track quotation → order conversion
- Success rate by client type
- Average discount given

#### 12.2 Product Performance
- Most quoted products
- Products with highest conversion
- Slow-moving items

#### 12.3 Pricing Insights
- Average discount by product category
- Pricing trends over time
- Competitive analysis

---

## 🔐 Security & Permissions

### 13. **Access Control**

#### 13.1 Role-Based Pricing
- Different discount limits per user role
- Approval workflow for high discounts
- Manager override for special pricing

#### 13.2 Quotation Locking
- Lock quotation after sending
- Prevent accidental edits
- Version control for changes

---

## 🚀 Priority Ranking

### **High Priority** (✅ IMPLEMENTED)
1. ✅ Remove discount from product details
2. ✅ Default "Your Price" = MRP
3. ✅ Manual GitHub push control
4. ✅ **Format 3: MRP + DISC% + FINAL PRICE**
5. ✅ **Format 4: MRP with GST breakdown in subtotal**
6. ✅ **Format 5: MRP + YOUR PRICE with GST breakdown**
7. ✅ **Format 6: Complete breakdown (MRP + DISC% + YOUR PRICE + GST)**
8. ✅ **Reverse GST calculation** (MRP includes GST)
9. ✅ **GST breakdown shown in subtotal only**

### **Medium Priority** (Pending)
10. 🔄 Bulk discount application
11. 🔄 Quotation versions
12. 🔄 Tax management (configurable GST rate)
13. 🔄 Additional charges
14. 🔄 Price validation
15. 🔄 Quick edit mode

### **Medium Priority**
6. 🔄 Quotation versions
7. 🔄 Tax management
8. 🔄 Additional charges
9. 🔄 Price validation
10. 🔄 Quick edit mode

### **Low Priority** (Nice to Have)
11. 🔄 Quotation templates
12. 🔄 Analytics & reporting
13. 🔄 Competitor comparison
14. 🔄 Link sharing
15. 🔄 Multiple export formats

---

## 📝 Notes

- All changes maintain backward compatibility
- Existing quotations should not break
- PDF generation should remain fast
- Mobile responsiveness is important
- Consider performance with large quotations (100+ products)

---

## 💻 Implementation Details

### **GST Calculation Formula**
```javascript
// Reverse GST Calculation (MRP includes GST)
const gstRate = 18; // 18% GST
const divisor = 100 + gstRate; // 118 for 18% GST
const taxableAmount = (mrp / divisor) * 100;
const gstAmount = mrp - taxableAmount;

// Example:
// MRP = ₹13,920 (including GST)
// Taxable Amount = (13,920 ÷ 118) × 100 = ₹11,796.61
// GST @18% = 13,920 - 11,796.61 = ₹2,123.39
```

### **Format Implementation**
- **Format 1-2**: Existing formats (no GST breakdown)
- **Format 3**: Added DISC% and FINAL PRICE columns
- **Format 4**: MRP only, GST breakdown in subtotal
- **Format 5**: MRP + YOUR PRICE, GST breakdown in subtotal
- **Format 6**: Complete (MRP + DISC% + YOUR PRICE), GST breakdown in subtotal

### **Files Modified**
1. `AdminBudgetPlanForm.jsx`:
   - Added `gstRate` state (default: 18%)
   - Updated `calculateTotals()` to include GST breakdown
   - Added 4 new format options (format3-6)
   - Updated table headers for all 6 formats
   - Added GST breakdown rows in subtotal
   - Added GST breakdown in grand total section
   - Pass `columnFormat` and `gstRate` to PDF generator

2. `QuotationPDFGenerator.jsx` (to be updated):
   - Accept `columnFormat` and `gstRate` parameters
   - Implement column rendering for formats 3-6
   - Add GST breakdown in PDF subtotals

### **State Management**
```javascript
const [columnFormat, setColumnFormat] = useState('format2'); // format1-6
const [gstRate, setGstRate] = useState(18); // GST rate percentage
```

### **Data Flow**
1. User selects format from radio buttons
2. Preview updates immediately with selected format
3. GST breakdown calculated using reverse formula
4. PDF generation uses same format and GST rate
5. All formats support price editing

---

## 📊 Format Comparison Table

| Format | MRP | DISC% | YOUR PRICE | FINAL PRICE | GST Breakdown | Use Case |
|--------|-----|-------|------------|-------------|---------------|----------|
| Format 1 | ✅ | ❌ | ✅ | ❌ | ❌ | Custom pricing |
| Format 2 | ✅ | ✅ | ❌ | ❌ | ❌ | Discount offers |
| Format 3 | ✅ | ✅ | ❌ | ✅ | ❌ | Transparent pricing |
| Format 4 | ✅ | ❌ | ❌ | ❌ | ✅ | Clean with tax |
| Format 5 | ✅ | ❌ | ✅ | ❌ | ✅ | Custom + tax |
| Format 6 | ✅ | ✅ | ✅ | ❌ | ✅ | Complete breakdown |

---

## 📝 Notes

- All changes should maintain backward compatibility
- Existing quotations should not break
- PDF generation should remain fast
- Mobile responsiveness is important
- Consider performance with large quotations (100+ products)

---

## 🤔 Questions to Consider

1. Should we allow negative discounts (price increase)?
2. Should discount be per product or per quotation?
3. How to handle currency conversion for international clients?
4. Should we support multiple currencies?
5. How long should quotation history be retained?
6. Should clients be able to request changes to quotation?
7. Do we need approval workflow for quotations above certain value?

---

**Status**: 📝 Requirements Gathering  
**Next Step**: Review and prioritize features with team  
**Created**: May 26, 2026
