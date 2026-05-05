import html2pdf from 'html2pdf.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function QuotationPDFGenerator(quotationData) {
  const {
    clientData,
    items,
    total,
    quotationNumber,
    quotationDate,
    rooms = [] // Array of rooms with their products
  } = quotationData;

  // If rooms are provided, use them; otherwise create a single room from items
  let roomsData = [];
  
  if (rooms.length > 0) {
    // Process rooms with areas structure
    roomsData = rooms.map(room => {
      // Flatten products from all areas
      let allProducts = [];
      if (room.areas && Array.isArray(room.areas)) {
        room.areas.forEach(area => {
          if (area.products && Array.isArray(area.products)) {
            allProducts = [...allProducts, ...area.products];
          }
        });
      } else if (room.products && Array.isArray(room.products)) {
        // Fallback for old format
        allProducts = room.products;
      }
      
      return {
        name: room.name,
        products: allProducts
      };
    });
  } else {
    // Fallback for items array
    roomsData = [
      {
        name: 'Products',
        products: items || []
      }
    ];
  }

  // Fetch company settings from API
  let companySettings;
  try {
    const response = await fetch(`${API_URL}/company-settings`);
    companySettings = await response.json();
  } catch (error) {
    console.error('Error fetching company settings:', error);
    // Fallback to default values if API fails
    companySettings = {
      bankName: 'State Bank of India',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      branchName: 'Ahmedabad Main Branch',
      termsAndConditions: {
        paymentTerms: ['50% advance, 50% before dispatch'],
        validity: ['Quotation valid for 30 days'],
        delivery: ['Ex-Works Ahmedabad', 'Delivery charges extra if applicable'],
        pricingAndTaxes: ['GST 18% applicable', 'Prices subject to change without notice']
      }
    };
  }

  // Generate room sections HTML
  const roomSectionsHTML = roomsData.map((room) => {
    const roomProducts = room.products || [];
    const roomTotal = roomProducts.reduce((sum, item) => {
      const baseRate = parseFloat(item.rate || item.unitPrice || 0);
      const gstRate = baseRate * 0.18;
      const rateWithGST = baseRate + gstRate;
      const quantity = parseInt(item.quantity || 1);
      return sum + (rateWithGST * quantity);
    }, 0);

    return `
      <div class="room-section">
        <div class="room-title">${room.name || 'Products'}</div>
        <div class="products-wrapper">
          <table class="products-table">
            <thead>
              <tr>
                <th class="col-sr">SR. NO.</th>
                <th class="col-desc">DESCRIPTION</th>
                <th class="col-qty">QTY</th>
                <th class="col-rate">RATE (Incl. GST ₹)</th>
                <th class="col-amount">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${roomProducts.map((item, index) => {
                const baseRate = parseFloat(item.rate || item.unitPrice || 0);
                const gstRate = baseRate * 0.18;
                const rateWithGST = baseRate + gstRate;
                const quantity = parseInt(item.quantity || 1);
                const amountWithGST = rateWithGST * quantity;
                
                return `
                <tr>
                  <td class="col-sr">${index + 1}</td>
                  <td class="col-desc">${item.productName || item.description || ''}</td>
                  <td class="col-qty">${quantity}</td>
                  <td class="col-rate">₹${rateWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="col-amount">₹${amountWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `;
              }).join('')}
              <tr class="total-row-table">
                <td colspan="4" class="total-label-cell">SUBTOTAL:</td>
                <td class="total-value-cell">₹${roomTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
          line-height: 1.2;
          background: #fff;
          margin: 0;
          padding: 0;
          font-weight: 500;
          width: 100%;
          position: relative;
        }
        
        p {
          margin: 0;
          padding: 0;
          line-height: 1.1;
          display: block;
        }
        
        .container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 5px 5px 40px 5px;
          background: white;
          box-sizing: border-box;
          position: relative;
        }
        
        .footer {
          margin-top: auto;
        }
        
        .footer-note {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          text-align: center;
          color: #fff;
          background: #2c3e50;
          font-size: 9px;
          padding: 10px 0;
          margin: 0;
        }
        
        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 30px;
          margin: 0 0 10px 0;
          padding: 0 0 10px 0;
          border-bottom: 1px solid #d1d5db;
        }
        
        .header-left {
          width: 50%;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-logo {
          width: auto;
          height: 75px;
          margin: 0;
          padding: 0;
          display: block;
        }
        
        .company-logo img {
          height: 100%;
          width: auto;
          object-fit: contain;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.3;
        }
        
        .header-right {
          width: 50%;
          text-align: right;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .right-content {
          margin: 0;
          padding: 0;
          text-align: left;
        }
        
        .company-tagline {
          font-size: 13px;
          color: #1e40af;
          font-weight: 600;
          margin: 0;
          padding: 0;
          letter-spacing: 0.7px;
          line-height: 1.4;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .company-info {
          font-size: 13px;
          color: #333;
          line-height: 1.5;
          margin: 0;
          padding: 0;
          text-align: left;
          font-weight: bold;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.3;
          text-align: right;
        }
        
        .company-info div {
          margin: 0;
          padding: 0;
          line-height: 1.5;
          display: block;
        }
        
        .helpline {
          margin: 0;
          padding: 0;
          font-weight: bold;
          line-height: 1.5;
          font-size: 13px;
        }
        
        /* Title Section */
        .title-section {
          text-align: center;
          margin: 10px 0;
          padding: 0;
        }
        
        .quotation-title {
          font-size: 18px;
          font-weight: bold;
          color: #000;
          margin: 5px 0;
          padding: 0;
          letter-spacing: 1px;
          line-height: 1.2;
        }
        
        .title-line {
          width: 100%;
          height: 1px;
          background: #d1d5db;
          margin: 5px auto;
        }
        
        /* Client Information Box */
        .client-box {
          border: 1px solid #d1d5db;
          padding: 5px 15px;
          margin: 5px 0;
          background: #fff;
          height: 100px;
          overflow: hidden;
        }
        
        .client-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 0;
          padding: 0;
        }
        
        .client-header-row {
          display: none;
        }
        
        .client-to-inline {
          font-size: 11px;
          font-weight: bold;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          flex: 1;
          display: none;
        }
        
        .client-attn-inline {
          display: none;
        }
        
        .client-ref-inline {
          font-size: 11px;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          flex: 0 0 auto;
          text-align: right;
          display: none;
        }
        
        .client-content-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 0;
          padding: 0;
        }
        
        .client-left-content {
          flex: 1;
          margin: 0;
          padding: 0;
          max-width: 65%;
          word-wrap: break-word;
        }
        
        .client-right-content {
          text-align: right;
          min-width: 200px;
          margin: 0;
          padding: 0;
        }
        
        .client-left {
          flex: 1;
          margin: 0;
          padding: 0;
        }
        
        .client-right-section {
          text-align: right;
          min-width: 400px;
          margin: 0;
          padding: 0;
        }
        
        .client-right-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin: 0 0 3px 0;
          padding: 0;
        }
        
        .client-to {
          font-size: 11px;
          font-weight: bold;
          color: #000;
          margin: 0 0 4px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-name {
          font-size: 11px;
          font-weight: bold;
          color: #000;
          margin: 0 0 6px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-address {
          font-size: 11px;
          color: #333;
          margin: 0 0 4px 0;
          padding: 0;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: normal;
          max-width: 100%;
        }
        
        .client-contact {
          font-size: 11px;
          color: #333;
          margin: 0 0 4px 0;
          padding: 0;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: normal;
        }
        
        .client-gst {
          font-size: 11px;
          color: #333;
          margin: 0 0 4px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-email {
          font-size: 11px;
          color: #333;
          margin: 0 0 2px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-attn {
          font-size: 11px;
          color: #333;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          font-weight: bold;
          text-align: left;
        }
        
        .client-right {
          text-align: right;
          min-width: 200px;
          margin: 0;
          padding: 0;
        }
        
        .client-ref,
        .client-date {
          font-size: 11px;
          color: #000;
          margin: 0 0 3px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-ref strong,
        .client-date strong {
          font-weight: bold;
        }
        
        .client-name {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }
        
        .client-email {
          font-size: 11px;
          color: #333;
          margin-bottom: 4px;
        }
        
        .client-attn {
          font-size: 11px;
          color: #333;
          margin-top: 6px;
        }
        
        .client-right {
          text-align: right;
          min-width: 200px;
        }
        
        .client-ref,
        .client-date {
          font-size: 11px;
          color: #000;
          margin-bottom: 4px;
        }
        
        .client-ref strong,
        .client-date strong {
          font-weight: bold;
        }
        
        /* Products Section - Simple Card-Based Format */
        .room-card-simple {
          margin-bottom: 20px;
          page-break-inside: avoid;
          border: 1px solid #d1d5db;
          background: #fff;
        }
        
        .room-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          padding: 12px 15px;
          border-bottom: 1px solid #d1d5db;
        }
        
        .room-card-title {
          margin: 0;
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .room-card-total {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .room-products-list {
          padding: 0;
          margin: 0;
        }
        
        .product-item-simple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid #f3f4f6;
          gap: 15px;
        }
        
        .product-item-simple:last-child {
          border-bottom: none;
        }
        
        .product-item-left {
          flex: 1;
          min-width: 0;
        }
        
        .product-item-name {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          word-wrap: break-word;
        }
        
        .product-item-variant {
          font-size: 11px;
          color: #6b7280;
          margin: 0;
        }
        
        .product-item-qty {
          font-size: 11px;
          color: #4b5563;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .product-item-price {
          font-size: 12px;
          font-weight: bold;
          color: #1f2937;
          text-align: right;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 100px;
        }
        
        /* Footer */
        .footer {
          margin-top: 5px;
        }
        
        .terms-box {
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 5px 10px;
          border-radius: 0;
          margin-bottom: 3px;
        }
        
        .terms-title {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          margin: 0 0 2px 0;
          padding: 0;
        }
        
        .terms-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          font-size: 11px;
          color: #333;
          line-height: 1.1;
        }
        
        .terms-column {
          margin: 0;
          padding: 0;
        }
        
        .terms-category {
          margin-bottom: 0;
        }
        
        .terms-category:last-child {
          margin-bottom: 0;
        }
        
        .terms-category-title {
          font-weight: bold;
          color: #000;
          margin: 0;
          font-size: 11px;
        }
        
        .terms-category ul {
          margin: 0;
          padding: 0 0 0 15px;
          list-style: disc;
        }
        
        .terms-category li {
          margin: 0;
          padding: 0;
          line-height: 1.1;
        }
        
        .bank-details {
          border: 1px solid #d1d5db;
          padding: 5px 10px;
          border-radius: 0;
          margin-bottom: 3px;
          background: #fff;
        }
        
        .bank-title {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          margin-bottom: 2px;
        }
        
        .bank-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          font-size: 11px;
          color: #333;
          line-height: 1.1;
        }
        
        .bank-column {
          margin: 0;
          padding: 0;
        }
        
        .bank-item {
          margin-bottom: 2px;
        }
        
        .bank-item:last-child {
          margin-bottom: 0;
        }
        
        .bank-label {
          font-weight: bold;
          color: #000;
          margin-bottom: 0;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .container {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Section -->
        <div class="header">
          <div class="header-left">
            <div class="right-content">
              <div class="company-tagline">BATHTUB | CP FITTING | SANITARY WARE | TILES</div>
              <div class="company-info">
                <div>104-105-106, Iscon Plaza, Opp. Star India Bazar,</div>
                <div>Satellite Road, Ahmedabad - 380 015</div>
                <div>Phone: 92272 06063 | Email: gtss47@hotmail.com</div>
                <div class="helpline" style="color: #dc2626; font-weight: 600;">Helpline: 079-2692 0609 / 4006 6063</div>
              </div>
            </div>
          </div>
          <div class="header-right">
            <div class="company-logo">
              <img src="${window.location.origin}/gtss-logo.png" alt="GTSS Logo" />
            </div>
            <div class="company-name">Gujarat Tube & Sanitary Stores</div>
          </div>
        </div>
        
        <!-- Title Section -->
        <div class="title-section">
          <div class="quotation-title">QUOTATION</div>
          <div class="title-line"></div>
        </div>
        
        <!-- Client Information Box -->
        <div class="client-box">
          <div class="client-content-row">
            <div class="client-left-content">
              <div style="display: flex; gap: 10px; margin-bottom: 6px;">
                <div class="client-to" style="flex-shrink: 0;">TO:</div>
                <div class="client-name" style="margin: 0; flex: 1;">${clientData.companyName || '-'}</div>
              </div>
              ${clientData.address ? `<div class="client-address">${clientData.address}</div>` : ''}
              <div class="client-contact">
                ${clientData.mobileNumber ? `Contact: ${clientData.mobileNumber}` : ''} ${clientData.mobileNumber && clientData.email ? '|' : ''} ${clientData.email ? `Email: ${clientData.email}` : ''}
              </div>
              <div class="client-gst">GST Number: ${clientData.gstNumber || '-'}</div>
            </div>
            <div class="client-right-content">
              <div class="client-date"><strong>Date:</strong> ${new Date(quotationDate).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>
        
        <!-- Products Section - By Rooms -->
        ${roomSectionsHTML}
        
        <!-- Grand Total -->
        <div class="products-wrapper">
          <table class="products-table">
            <tbody>
              <tr class="total-row-table">
                <td colspan="4" class="total-label-cell">GRAND TOTAL AMOUNT:</td>
                <td class="total-value-cell">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <!-- Terms & Conditions -->
          <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-content">
              <div class="terms-column">
                <div class="terms-category">
                  <div class="terms-category-title">Payment Terms:</div>
                  <ul>
                    ${companySettings.termsAndConditions.paymentTerms.map(term => `<li>${term}</li>`).join('')}
                  </ul>
                </div>
                <div class="terms-category">
                  <div class="terms-category-title">Validity:</div>
                  <ul>
                    ${companySettings.termsAndConditions.validity.map(term => `<li>${term}</li>`).join('')}
                  </ul>
                </div>
              </div>
              <div class="terms-column">
                <div class="terms-category">
                  <div class="terms-category-title">Delivery:</div>
                  <ul>
                    ${companySettings.termsAndConditions.delivery.map(term => `<li>${term}</li>`).join('')}
                  </ul>
                </div>
                <div class="terms-category">
                  <div class="terms-category-title">Pricing & Taxes:</div>
                  <ul>
                    ${companySettings.termsAndConditions.pricingAndTaxes.map(term => `<li>${term}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bank Details -->
          <div class="bank-details">
            <div class="bank-title">Bank Details:</div>
            <div class="bank-content">
              <div class="bank-column">
                <div class="bank-item">
                  <div class="bank-label">Bank Name:</div>
                  <div>${companySettings.bankName}</div>
                </div>
                <div class="bank-item">
                  <div class="bank-label">Account No:</div>
                  <div>${companySettings.accountNumber}</div>
                </div>
              </div>
              <div class="bank-column">
                <div class="bank-item">
                  <div class="bank-label">IFSC Code:</div>
                  <div>${companySettings.ifscCode}</div>
                </div>
                <div class="bank-item">
                  <div class="bank-label">Branch:</div>
                  <div>${companySettings.branchName}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer-note">
            Thank you for your business! | Generated on ${new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // PDF options
  const options = {
    margin: [3, 3, 3, 3],
    filename: `Quotation-${quotationNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 1400 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true }
  };

  // Generate PDF
  html2pdf().set(options).from(htmlContent).save();
}

export default QuotationPDFGenerator;
