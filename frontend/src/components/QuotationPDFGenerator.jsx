import html2pdf from 'html2pdf.js';

function QuotationPDFGenerator(quotationData) {
  const {
    clientData,
    items,
    gst,
    subtotal,
    gstAmount,
    total,
    quotationNumber,
    quotationDate
  } = quotationData;

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
        }
        
        p {
          margin: 0;
          padding: 0;
          line-height: 1.1;
          display: block;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3px 30px 15px 30px;
          background: white;
        }
        
        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 30px;
          margin: 0 0 5px 0;
          padding: 0;
          border-bottom: 2px solid #333;
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
          margin: 3px 0;
          padding: 0;
        }
        
        .quotation-title {
          font-size: 22px;
          font-weight: bold;
          color: #000;
          margin: 5px 0;
          padding: 0;
          letter-spacing: 1px;
          line-height: 1.2;
        }
        
        .title-line {
          width: 100%;
          height: 2px;
          background: #333;
          margin: 3px auto;
        }
        
        /* Client Information Box */
        .client-box {
          border: 1px solid #ccc;
          padding: 12px 15px;
          margin: 15px 0;
          background: #fafafa;
        }
        
        .client-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 0;
          padding: 0;
        }
        
        .client-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin: 0 0 4px 0;
          padding: 0;
        }
        
        .client-to-inline {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          flex: 1;
        }
        
        .client-attn-inline {
          font-size: 11px;
          color: #333;
          font-weight: bold;
          margin: 0 50px 0 0;
          padding: 0;
          line-height: 1.2;
          flex: 0 0 auto;
          text-align: right;
        }
        
        .client-ref-inline {
          font-size: 11px;
          color: #000;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          flex: 0 0 auto;
          text-align: right;
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
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin: 0 0 4px 0;
          padding: 0;
          line-height: 1.2;
        }
        
        .client-name {
          font-size: 13px;
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
        
        /* Products Table */
        .products-section {
          margin-bottom: 0;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          border: 1px solid #ddd;
        }
        
        .products-table thead {
          background: #f5f5f5;
        }
        
        .products-table th {
          padding: 12px 10px;
          text-align: left;
          font-weight: bold;
          color: #000;
          font-size: 11px;
          border-bottom: 1px solid #ddd;
        }
        
        .products-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #e8e8e8;
          font-size: 11px;
          color: #333;
          vertical-align: top;
        }
        
        .products-table tbody tr:last-child td {
          border-bottom: 1px solid #ddd;
        }
        
        .products-table tbody tr:hover {
          background: #fafafa;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        /* Totals Section */
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin: 10px 0 20px 0;
        }
        
        .totals-box {
          width: 35%;
          border: none;
          background: transparent;
          padding: 0;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 10px;
          font-size: 12px;
          color: #333;
        }
        
        .total-row.grand-total {
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 6px;
          font-weight: bold;
          font-size: 16px;
          color: #000;
        }
        
        .total-label {
          font-weight: 600;
          color: #000;
          text-align: left;
        }
        
        .total-value {
          font-weight: 600;
          color: #000;
          text-align: right;
        }
        
        .grand-total .total-label {
          font-weight: bold;
        }
        
        .grand-total .total-value {
          font-size: 16px;
          font-weight: bold;
        }
        
        /* Footer */
        .footer {
          margin-top: 30px;
        }
        
        .terms-box {
          border: 1px solid #e0e0e0;
          background: #fff;
          padding: 15px 20px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .terms-title {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          margin: 0 0 10px 0;
          padding: 0;
        }
        
        .terms-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          font-size: 11px;
          color: #333;
          line-height: 1.4;
        }
        
        .terms-column {
          margin: 0;
          padding: 0;
        }
        
        .terms-category {
          margin-bottom: 10px;
        }
        
        .terms-category:last-child {
          margin-bottom: 0;
        }
        
        .terms-category-title {
          font-weight: bold;
          color: #000;
          margin: 0 0 4px 0;
          font-size: 11px;
        }
        
        .terms-category ul {
          margin: 0;
          padding: 0 0 0 15px;
          list-style: disc;
        }
        
        .terms-category li {
          margin: 2px 0;
          padding: 0;
          line-height: 1.4;
        }
        
        .bank-details {
          border: 1px solid #e0e0e0;
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          background: #fff;
        }
        
        .bank-title {
          font-size: 11px;
          font-weight: bold;
          color: #000;
          margin-bottom: 6px;
        }
        
        .bank-content {
          font-size: 10px;
          color: #555;
          line-height: 1.6;
        }
        
        .footer-note {
          text-align: center;
          color: #999;
          font-size: 9px;
          padding-top: 10px;
          border-top: 1px solid #e8e8e8;
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
          <div class="client-header-row">
            <div class="client-to-inline">TO:</div>
            <div class="client-attn-inline">Attn: ${clientData.clientName}</div>
            <div class="client-ref-inline"><strong>Ref No:</strong> ${quotationNumber}</div>
          </div>
          <div class="client-content-row">
            <div class="client-left-content">
              <div class="client-name">${clientData.companyName || '-'}</div>
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
        
        <!-- Products Table -->
        <div class="products-section">
          <table class="products-table">
            <thead>
              <tr>
                <th style="width: 10%;">SR. NO.</th>
                <th style="width: 45%;">DESCRIPTION</th>
                <th style="width: 15%;" class="text-center">QTY</th>
                <th style="width: 15%;" class="text-right">RATE (₹)</th>
                <th style="width: 15%;" class="text-right">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${parseFloat(item.rate).toFixed(2)}</td>
                  <td class="text-right">₹${parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-box">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">₹${subtotal.toFixed(2)}</span>
            </div>
            ${gst > 0 ? `
              <div class="total-row">
                <span class="total-label">GST (${gst}%):</span>
                <span class="total-value">₹${gstAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span class="total-label">TOTAL AMOUNT:</span>
              <span class="total-value">₹${total.toFixed(2)}</span>
            </div>
          </div>
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
                    <li>50% advance, 50% before dispatch</li>
                  </ul>
                </div>
                <div class="terms-category">
                  <div class="terms-category-title">Validity:</div>
                  <ul>
                    <li>Quotation valid for 30 days</li>
                  </ul>
                </div>
              </div>
              <div class="terms-column">
                <div class="terms-category">
                  <div class="terms-category-title">Delivery:</div>
                  <ul>
                    <li>Ex-Works Ahmedabad</li>
                    <li>Delivery charges extra if applicable</li>
                  </ul>
                </div>
                <div class="terms-category">
                  <div class="terms-category-title">Pricing & Taxes:</div>
                  <ul>
                    <li>GST 18% applicable</li>
                    <li>Prices subject to change without notice</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bank Details (Optional) -->
          <div class="bank-details">
            <div class="bank-title">Bank Details:</div>
            <div class="bank-content">
              Bank Name: [Your Bank Name] | Account No: [Account Number] | IFSC Code: [IFSC Code] | Branch: [Branch Name]
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
    margin: [2, 0.5, 0.5, 1],
    filename: `Quotation-${quotationNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };

  // Generate PDF
  html2pdf().set(options).from(htmlContent).save();
}

export default QuotationPDFGenerator;
