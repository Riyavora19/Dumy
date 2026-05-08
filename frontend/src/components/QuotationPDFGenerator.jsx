import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safely read localStorage */
function getLocal(key, fallback = '') {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

/** Get the base origin from API_URL */
function getBaseUrl() {
  try {
    return new URL(API_URL).origin;
  } catch {
    return '';
  }
}

/** Calculate discounted rate for a single item */
function calcDiscountedRate(item) {
  const baseRate = parseFloat(item.rate ?? item.unitPrice ?? 0);
  const discountPct = parseFloat(item.discountPercent ?? 0);
  return baseRate * (1 - discountPct / 100);
}

/** Calculate total amount for a single line item */
function calcLineAmount(item) {
  return calcDiscountedRate(item) * parseInt(item.quantity ?? 1);
}

/** Load image as base64 for jsPDF */
async function loadImageAsBase64(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Single PDF Generator (for one room or all rooms) ──────────────────────

async function generateSinglePDF(quotationData, roomsToInclude, revisionNumber = null) {
  try {
    const {
      clientData,
      items,
      quotationNumber,
      quotationDate,
      rooms = [],
    } = quotationData;

  // Build rooms data
  let roomsData = [];

  if (rooms.length > 0) {
    roomsData = rooms.map((room) => {
      let allProducts = [];
      if (room.areas && Array.isArray(room.areas)) {
        room.areas.forEach((area) => {
          if (area.products && Array.isArray(area.products)) {
            area.products.forEach((product) => {
              allProducts.push({ ...product, areaName: area.name || 'General' });
            });
          }
        });
      } else if (room.products && Array.isArray(room.products)) {
        allProducts = room.products;
      }
      return { name: room.name, products: allProducts };
    });
  } else {
    roomsData = [{ name: 'Products', products: items || [] }];
  }

  // Filter rooms if specific rooms are requested
  if (roomsToInclude && roomsToInclude.length > 0) {
    roomsData = roomsData.filter(room => roomsToInclude.includes(room.name));
  }

  // Pre-calculate totals
  const enrichedRooms = roomsData.map((room) => ({
    ...room,
    calculatedTotal: (room.products || []).reduce(
      (sum, item) => sum + calcLineAmount(item),
      0
    ),
  }));

  // Grand total
  const grandTotal = enrichedRooms.reduce((s, r) => s + r.calculatedTotal, 0);

  // Update quotation number with revision if provided
  const displayQuotationNumber = revisionNumber 
    ? `${quotationNumber} - Revised ${revisionNumber}`
    : quotationNumber;

  // Load logo image
  const logoOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${logoOrigin}/gtss-logo.png`;
  const logoBase64 = await loadImageAsBase64(logoUrl);

  // Resolve admin/staff info - prioritize attendedBy from quotationData
  const attendedByStaffId = quotationData.attendedByStaffId || getLocal('staffId') || '';
  const attendedByName = quotationData.attendedByName || getLocal('staffName') || getLocal('adminName') || 'ADMIN';
  const adminPhone = quotationData.attendedByPhone || getLocal('staffPhone') || getLocal('adminPhone') || '';

  // Create PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 5;
  const marginRight = 5;
  
  // Spacing as per requirements:
  // 5mm space before logo/company
  // 25mm for logo and company name section
  // 10mm for quotation header
  // 25mm for client details
  
  let yPos = 5; // 5mm top space before logo

  // ─── HEADER SECTION (25mm total) ──────────────────────────────────────────

  const headerStartY = yPos;
  
  // Line 1: TILES | CP FITTING | SANITARY | BATHTUB (Blue, Bold, 10pt)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('TILES | CP FITTING | SANITARY | BATHTUB', marginLeft, yPos);
  
  yPos += 5;
  
  // Line 2: Address line 1 (Black, Bold, 9pt)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black color
  doc.text('104-105-106, Iscon Plaza, Opp. Star India Bazar,', marginLeft, yPos);
  
  yPos += 4.5;
  
  // Line 3: Address line 2 (Black, Bold, 9pt)
  doc.text('Satellite Road, Ahmedabad - 380 015', marginLeft, yPos);
  
  yPos += 4.5;
  const phoneLineY = yPos;
  
  // Line 4: Phone and Email (Black, Bold, 9pt)
  doc.text('Phone: 92272 06063 | Email: gtts47@gmail.com', marginLeft, yPos);
  
  yPos += 4.5;
  const helplineY = yPos;
  
  // Line 5: Helpline (Red, Bold, 9pt)
  doc.setTextColor(255, 0, 0); // Red color
  doc.text('Helpline: 079-2692 0609 / 4006 6063', marginLeft, yPos);

  // Calculate "Sanitary Stores" width to determine logo width
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const sanitaryStoresText = 'Sanitary Stores';
  const sanitaryStoresWidth = doc.getTextWidth(sanitaryStoresText);

  // Right side - Logo (smaller width, height spans BATHTUB to Phone line)
  if (logoBase64) {
    // Logo height spans from BATHTUB to Phone line
    const logoHeight = phoneLineY - headerStartY + 3;
    // Logo width - make it smaller (50% of Sanitary Stores text width)
    const logoWidth = sanitaryStoresWidth * 0.5;
    const logoX = pageWidth - marginRight - logoWidth;
    const logoY = headerStartY - 2;
    try {
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }

  // Company name (Black, Bold, 14pt, aligned with helpline, closer to logo)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const companyName = 'Gujarat Tube & Sanitary Stores';
  const companyNameWidth = doc.getTextWidth(companyName);
  // Position at same Y as helpline, right-aligned
  doc.text(companyName, pageWidth - marginRight - companyNameWidth, helplineY);

  // QUOTATION starts immediately after header with minimal gap
  yPos += 3; // 3mm gap for spacing

  // ─── QUOTATION TITLE (10mm section) ───────────────────────────────────────

  // Line above QUOTATION
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  yPos += 5;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const title = 'QUOTATION';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  
  yPos += 2;
  
  // Line below QUOTATION
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  // Small gap before client details
  yPos += 3;

  // ─── CLIENT INFORMATION BOX (25mm section) ────────────────────────────────

  const boxStartY = yPos;
  const boxHeight = 25; // Exactly 25mm for client details
  
  doc.setDrawColor(208, 208, 208);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, boxStartY, pageWidth - marginLeft - marginRight, boxHeight);

  let clientYPos = boxStartY + 5;
  
  // Left side - Client details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const clientName = clientData.companyName || clientData.customerName || '-';
  doc.text(`TO: ${clientName}`, marginLeft + 3, clientYPos);
  
  clientYPos += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  
  const clientAddress = clientData.address || clientData.customerAddress || '';
  if (clientAddress) {
    doc.text(`Address: ${clientAddress}`, marginLeft + 3, clientYPos);
    clientYPos += 4;
  }
  
  const clientEmail = clientData.email || clientData.customerEmail || '';
  if (clientEmail) {
    doc.text(`Email: ${clientEmail}`, marginLeft + 3, clientYPos);
    clientYPos += 4;
  }
  
  const clientPhone = clientData.phone || clientData.customerPhone || '';
  if (clientPhone) {
    doc.text(`Phone Number: ${clientPhone}`, marginLeft + 3, clientYPos);
    clientYPos += 4;
  }
  
  doc.text(`GST Number: ${clientData.gstNumber || clientData.customerGST || '-'}`, marginLeft + 3, clientYPos);
  
  // Project Location (centered between left and right sections)
  const projectLocation = clientData.projectLocation || '';
  if (projectLocation) {
    const centerX = pageWidth / 2;
    const projectLocationY = boxStartY + 12; // Vertically centered in the box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Project Location:', centerX, projectLocationY, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text(projectLocation, centerX, projectLocationY + 4, { align: 'center' });
  }

  // Right side - Date, Reference Number, Atten
  let rightYPos = boxStartY + 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  const formattedDate = new Date(quotationDate).toLocaleDateString('en-GB');
  const dateText = `Date: ${formattedDate}`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - marginRight - dateWidth - 3, rightYPos);
  
  rightYPos += 4;
  doc.setFont('helvetica', 'normal');
  const refText = `Reference Number: ${displayQuotationNumber}`;
  const refWidth = doc.getTextWidth(refText);
  doc.text(refText, pageWidth - marginRight - refWidth - 3, rightYPos);
  
  rightYPos += 4;
  const attenText = `Atten: ${clientData.attention || '-'}`;
  const attenWidth = doc.getTextWidth(attenText);
  doc.text(attenText, pageWidth - marginRight - attenWidth - 3, rightYPos);

  yPos = boxStartY + boxHeight + 8;

  // ─── PRODUCTS TABLES ──────────────────────────────────────────────────────

  for (const room of enrichedRooms) {
    // Room title
    doc.setFillColor(229, 231, 235);
    doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const roomTitle = (room.name || 'Products').toUpperCase();
    const roomTitleWidth = doc.getTextWidth(roomTitle);
    doc.text(roomTitle, (pageWidth - roomTitleWidth) / 2, yPos + 5);
    
    yPos += 7;

    // Group products by area
    const productsByArea = {};
    (room.products || []).forEach((product) => {
      const areaName = product.areaName || '';
      if (!productsByArea[areaName]) productsByArea[areaName] = [];
      productsByArea[areaName].push(product);
    });

    // Build table data
    const tableData = [];
    let serialNumber = 1;

    for (const [areaName, products] of Object.entries(productsByArea)) {
      products.forEach((item, index) => {
        const baseRate = parseFloat(item.rate ?? item.unitPrice ?? 0); // MRP
        const discountedRate = calcDiscountedRate(item); // Your Price
        const quantity = parseInt(item.quantity ?? 1);
        const amount = discountedRate * quantity;

        const itemName = item.productName || item.description || '';
        const variant = item.variant || '';
        const company = item.companyName || '';
        const itemText = [itemName, variant, company].filter(Boolean).join('\n');

        // For the first product in an area, add the area name with rowSpan
        // For subsequent products, the area cell will be automatically merged
        if (index === 0) {
          tableData.push([
            serialNumber.toString(),
            { content: areaName.toUpperCase(), rowSpan: products.length, styles: { valign: 'middle', halign: 'center' } },
            '', // Image placeholder
            itemText,
            quantity.toString(),
            `Rs. ${baseRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // MRP
            `Rs. ${discountedRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Your Price
            `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Total
          ]);
        } else {
          tableData.push([
            serialNumber.toString(),
            // Area cell is merged from first row, so we don't add it here
            '', // Image placeholder
            itemText,
            quantity.toString(),
            `Rs. ${baseRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // MRP
            `Rs. ${discountedRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Your Price
            `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Total
          ]);
        }
        serialNumber++;
      });
    }

    // Add subtotal row
    tableData.push([
      { content: 'SUBTOTAL:', colSpan: 7, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `Rs. ${room.calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', halign: 'right' } },
    ]);

    // Draw table
    const availableWidth = pageWidth - marginLeft - marginRight;
    doc.autoTable({
      startY: yPos,
      margin: { left: marginLeft, right: marginRight },
      head: [['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'YOUR PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      tableWidth: availableWidth, // Force table to use full available width
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200], // Light gray border
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [249, 249, 249],
        textColor: [50, 50, 50], // Darker gray text
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9, // Increased from 8 to 9
        lineColor: [200, 200, 200], // Light gray border for header
      },
      columnStyles: {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },  // SR - 5%
        1: { cellWidth: availableWidth * 0.10, halign: 'center', valign: 'middle' },  // AREA - 10%
        2: { cellWidth: availableWidth * 0.12, halign: 'center' },  // IMAGE - 12%
        3: { cellWidth: availableWidth * 0.28, halign: 'left' },    // ITEM - 28%
        4: { cellWidth: availableWidth * 0.07, halign: 'center' },  // QTY - 7%
        5: { cellWidth: availableWidth * 0.12, halign: 'center' },  // MRP - 12%
        6: { cellWidth: availableWidth * 0.13, halign: 'center' },  // YOUR PRICE - 13%
        7: { cellWidth: availableWidth * 0.13, halign: 'right' },   // TOTAL - 13%
      },
    });

    yPos = doc.lastAutoTable.finalY + 5;
  }

  // ─── GRAND TOTAL ──────────────────────────────────────────────────────────

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Calculate positions for right alignment
  const grandTotalText = `Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const grandTotalWidth = doc.getTextWidth(grandTotalText);
  const grandTotalLabelWidth = doc.getTextWidth('GRAND TOTAL AMOUNT:');
  
  // Position GRAND TOTAL AMOUNT: label on the right side, before the amount
  doc.text('GRAND TOTAL AMOUNT:', pageWidth - marginRight - grandTotalWidth - grandTotalLabelWidth - 5, yPos);
  doc.text(grandTotalText, pageWidth - marginRight - grandTotalWidth, yPos);
  
  yPos += 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  yPos += 8;

  // ─── SUMMARY TABLE (if multiple rooms) ───────────────────────────────────

  if (enrichedRooms.length > 1) {
    // Summary title with gray background (same style as room titles)
    doc.setFillColor(229, 231, 235);
    doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const summaryTitle = 'SUMMARY';
    const summaryTitleWidth = doc.getTextWidth(summaryTitle);
    doc.text(summaryTitle, (pageWidth - summaryTitleWidth) / 2, yPos + 5);
    
    yPos += 7;

    const summaryData = enrichedRooms.map((room, index) => [
      (index + 1).toString(),
      room.name || 'Products',
      `Rs. ${room.calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    ]);

    summaryData.push([
      { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, styles: { fontStyle: 'bold', halign: 'right' } },
    ]);

    const summaryAvailableWidth = pageWidth - marginLeft - marginRight;
    doc.autoTable({
      startY: yPos,
      margin: { left: marginLeft, right: marginRight },
      head: [['SR.NO.', 'BATHROOM', 'AMOUNT']],
      body: summaryData,
      theme: 'grid',
      tableWidth: summaryAvailableWidth,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200], // Light gray border
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        lineColor: [200, 200, 200], // Light gray border for header
      },
      columnStyles: {
        0: { cellWidth: summaryAvailableWidth * 0.15, halign: 'center' },  // SR.NO. - 15%
        1: { cellWidth: summaryAvailableWidth * 0.60, halign: 'center' },  // BATHROOM - 60%
        2: { cellWidth: summaryAvailableWidth * 0.25, halign: 'right' },   // AMOUNT - 25%
      },
    });

    yPos = doc.lastAutoTable.finalY + 5;
  }

  // ─── TERMS & CONDITIONS ───────────────────────────────────────────────────

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TERMS & CONDITIONS', marginLeft, yPos);
  
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '1. PAYMENT ADVANCE ALONG WITH ORDER',
    '2. RATES ARE INCLUSIVE OF GST',
    '3. CARTING EXTRA',
    '4. DELIVERY WITHIN A WEEK',
  ];
  
  terms.forEach((term) => {
    doc.text(term, marginLeft + 5, yPos);
    yPos += 4;
  });

  // Creator info (right side)
  const creatorY = yPos - 16;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ATTENDED BY:', pageWidth - marginRight - 40, creatorY);
  doc.setFont('helvetica', 'bold');
  if (attendedByStaffId) {
    doc.text(`${attendedByStaffId} - ${attendedByName}`, pageWidth - marginRight - 40, creatorY + 4);
  } else {
    doc.text(attendedByName, pageWidth - marginRight - 40, creatorY + 4);
  }
  doc.setFont('helvetica', 'normal');
  if (adminPhone) {
    doc.text(adminPhone, pageWidth - marginRight - 40, creatorY + 8);
  }

  // ─── FOOTER (25mm space for company logos + 5mm bottom margin) ───────────

  // Footer starts 30mm from bottom (25mm footer + 5mm margin)
  const footerStartY = pageHeight - 30;
  
  // Company logos section (25mm height)
  doc.setFillColor(249, 249, 249);
  doc.rect(0, footerStartY, pageWidth, 25, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const companiesText = 'COMPANIES WE SERVE';
  const companiesTextWidth = doc.getTextWidth(companiesText);
  doc.text(companiesText, (pageWidth - companiesTextWidth) / 2, footerStartY + 5);
  
  // Company logos grid
  const logos = [
    'Artize.png', 'Duravit.png', 'Jaguar.png', 'Johnson.png',
    'Kajaria.png', 'Kohler.png', 'Milagro.png', 'Parryware.png',
    'Qutone.png', 'Simero.png', 'Simpolo.png', 'TrueBlock.png', 'Woven.png'
  ];
  
  const logosPerRow = 7; // 7 logos in first row, 6 in second row
  const logoWidth = 20;
  const logoHeight = 8;
  const logoSpacing = 6;
  const startY = footerStartY + 8;
  
  // First row (7 logos)
  const firstRowStartX = (pageWidth - (logosPerRow * logoWidth + (logosPerRow - 1) * logoSpacing)) / 2;
  for (let i = 0; i < 7; i++) {
    const logoPath = `/company-logos/${logos[i]}`;
    const xPos = firstRowStartX + i * (logoWidth + logoSpacing);
    try {
      doc.addImage(logoPath, 'PNG', xPos, startY, logoWidth, logoHeight);
    } catch (err) {
      console.warn(`Failed to load logo: ${logos[i]}`);
    }
  }
  
  // Second row (6 logos)
  const secondRowLogos = 6;
  const secondRowStartX = (pageWidth - (secondRowLogos * logoWidth + (secondRowLogos - 1) * logoSpacing)) / 2;
  for (let i = 7; i < 13; i++) {
    const logoPath = `/company-logos/${logos[i]}`;
    const xPos = secondRowStartX + (i - 7) * (logoWidth + logoSpacing);
    try {
      doc.addImage(logoPath, 'PNG', xPos, startY + logoHeight + 2, logoWidth, logoHeight);
    } catch (err) {
      console.warn(`Failed to load logo: ${logos[i]}`);
    }
  }
  
  // Bottom footer bar (5mm margin from bottom)
  doc.setFillColor(44, 62, 80);
  doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  const footerText = `Thank you for your business! | Generated on ${new Date().toLocaleString('en-IN')}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 2);

  // ─── SAVE PDF ─────────────────────────────────────────────────────────────

  // Generate filename based on revision number and room name
  let filename = `Quotation-${quotationNumber}`;
  if (revisionNumber) {
    const roomName = roomsData.length === 1 ? roomsData[0].name.replace(/\s+/g, '-') : 'Multiple';
    filename = `Quotation-${quotationNumber}-Revised-${revisionNumber}-${roomName}`;
  }
  doc.save(`${filename}.pdf`);
  
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert(`Failed to generate PDF: ${error.message}`);
    throw error;
  }
}

// ─── Main QuotationPDFGenerator (handles multiple PDFs) ────────────────────

async function QuotationPDFGenerator(quotationData, options = {}) {
  const { separateByRoom = false } = options;
  
  try {
    const { rooms = [] } = quotationData;
    
    // Build rooms data to get room names
    let roomsData = [];
    if (rooms.length > 0) {
      roomsData = rooms.map((room) => {
        let allProducts = [];
        if (room.areas && Array.isArray(room.areas)) {
          room.areas.forEach((area) => {
            if (area.products && Array.isArray(area.products)) {
              area.products.forEach((product) => {
                allProducts.push({ ...product, areaName: area.name || 'General' });
              });
            }
          });
        } else if (room.products && Array.isArray(room.products)) {
          allProducts = room.products;
        }
        return { name: room.name, products: allProducts };
      });
    }
    
    // If separateByRoom is true and there are multiple rooms, generate separate PDFs
    if (separateByRoom && roomsData.length > 1) {
      for (let i = 0; i < roomsData.length; i++) {
        const room = roomsData[i];
        await generateSinglePDF(quotationData, [room.name], i + 1);
        // Add a small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      // Generate single PDF with all rooms
      await generateSinglePDF(quotationData, null, null);
    }
  } catch (error) {
    console.error('Error generating PDF(s):', error);
    alert(`Failed to generate PDF(s): ${error.message}`);
    throw error;
  }
}

export default QuotationPDFGenerator;
