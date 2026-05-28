// PDF COMPRESSION VERSION: 2.0 - Aggressive Compression (80x80px, 40% quality)
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

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

/** Load image as base64 for jsPDF with compression */
async function loadImageAsBase64(url, maxWidth = 150, maxHeight = 150, quality = 0.4) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    
    console.log(`🖼️ Compressing image: ${url.substring(url.lastIndexOf('/') + 1)} - Original size: ${(blob.size / 1024).toFixed(2)}KB`);
    
    // Create image element to get dimensions and compress
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG with aggressive compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSize = (compressedDataUrl.length * 0.75) / 1024; // Approximate size in KB
        console.log(`✅ Compressed to: ${width}x${height}px, ${compressedSize.toFixed(2)}KB (${quality * 100}% quality)`);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => resolve(null);
      
      // Load image from blob
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Draw header on page */
function drawHeader(doc, logoBase64, pageWidth, pageHeight) {
  const marginLeft = 5;
  const marginRight = 5;
  let yPos = 5;

  // Line 1: TILES | CP FITTING | SANITARY | BATHTUB (Blue, Bold, 10pt)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('TILES | CP FITTING | SANITARY | BATHTUB', marginLeft, yPos);
  
  yPos += 5;
  
  // Line 2: Address line 1 (Black, Bold, 9pt)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
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
  doc.setTextColor(255, 0, 0);
  doc.text('Helpline: 079-2692 0609 / 4006 6063', marginLeft, yPos);

  // Calculate "Sanitary Stores" width to determine logo width
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const sanitaryStoresText = 'Sanitary Stores';
  const sanitaryStoresWidth = doc.getTextWidth(sanitaryStoresText);

  // Right side - Logo
  if (logoBase64) {
    const logoHeight = phoneLineY - 5 + 3;
    const logoWidth = sanitaryStoresWidth * 0.5;
    const logoX = pageWidth - marginRight - logoWidth;
    const logoY = 5 - 2;
    try {
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }

  // Company name (Black, Bold, 14pt, aligned with helpline)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const companyName = 'Gujarat Tube & Sanitary Stores';
  const companyNameWidth = doc.getTextWidth(companyName);
  doc.text(companyName, pageWidth - marginRight - companyNameWidth, helplineY);

  yPos += 3;

  // Line above QUOTATION
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  yPos += 5;
  
  // QUOTATION text
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
  
  yPos += 3;
  
  return yPos; // Return Y position after header (around 40mm)
}

/** Draw footer on page */
function drawFooter(doc, pageWidth, pageHeight, activeLogos = null) {
  const footerStartY = pageHeight - 30;
  
  // Company logos section (25mm height) - NO HEADER TEXT
  doc.setFillColor(249, 249, 249);
  doc.rect(0, footerStartY, pageWidth, 25, 'F');
  
  // Use provided logos or fallback to defaults
  let logos = activeLogos;
  if (!logos || logos.length === 0) {
    // Fallback to default logos
    logos = [
      { path: '/company-logos/Artize.png' },
      { path: '/company-logos/Duravit.png' },
      { path: '/company-logos/Jaguar.png' },
      { path: '/company-logos/Johnson.png' },
      { path: '/company-logos/Kajaria.png' },
      { path: '/company-logos/Kohler.png' },
      { path: '/company-logos/Milagro.png' },
      { path: '/company-logos/Parryware.png' },
      { path: '/company-logos/Qutone.png' },
      { path: '/company-logos/Simero.png' },
      { path: '/company-logos/Simpolo.png' },
      { path: '/company-logos/TrueBlock.png' },
      { path: '/company-logos/Woven.png' }
    ];
  }
  
  const logosPerRow = 7;
  const logoWidth = 15;
  const logoHeight = 8;
  const logoSpacing = 6;
  const startY = footerStartY + 5;
  
  // First row (up to 7 logos)
  const firstRowCount = Math.min(logos.length, 7);
  const firstRowStartX = (pageWidth - (firstRowCount * logoWidth + (firstRowCount - 1) * logoSpacing)) / 2;
  for (let i = 0; i < firstRowCount; i++) {
    const logoPath = logos[i].path;
    const xPos = firstRowStartX + i * (logoWidth + logoSpacing);
    try {
      doc.addImage(logoPath, 'PNG', xPos, startY, logoWidth, logoHeight);
    } catch (err) {
      console.warn(`Failed to load logo: ${logoPath}`);
    }
  }
  
  // Second row (remaining logos, up to 6)
  if (logos.length > 7) {
    const secondRowCount = Math.min(logos.length - 7, 6);
    const secondRowStartX = (pageWidth - (secondRowCount * logoWidth + (secondRowCount - 1) * logoSpacing)) / 2;
    for (let i = 7; i < 7 + secondRowCount; i++) {
      const logoPath = logos[i].path;
      const xPos = secondRowStartX + (i - 7) * (logoWidth + logoSpacing);
      try {
        doc.addImage(logoPath, 'PNG', xPos, startY + logoHeight + 2, logoWidth, logoHeight);
      } catch (err) {
        console.warn(`Failed to load logo: ${logoPath}`);
      }
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
  
  return footerStartY; // Return Y position where footer starts
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
      columnFormat = 'format2', // Default to format2 if not provided
    } = quotationData;

  // Fetch active logos from API
  let activeLogos = null;
  try {
    const response = await fetch('https://dumy-2-mli2.onrender.com/api/quotation-settings');
    const data = await response.json();
    if (data.success) {
      activeLogos = data.data.footerLogos.filter(logo => logo.active).sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error('Failed to fetch logos:', error);
  }

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

  // Load logo image with compression (max 120x120px, 50% quality)
  const logoOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${logoOrigin}/gtss-logo.png`;
  const logoBase64 = await loadImageAsBase64(logoUrl, 120, 120, 0.5);

  // Resolve admin/staff info - prioritize attendedBy from quotationData
  const attendedByStaffId = quotationData.attendedByStaffId || getLocal('staffId') || '';
  const attendedByName = quotationData.attendedByName || getLocal('staffName') || getLocal('adminName') || 'ADMIN';
  const adminPhone = quotationData.attendedByPhone || getLocal('staffPhone') || getLocal('adminPhone') || '';

  // Create PDF with compression enabled
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true, // Enable PDF compression
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
  
  // Project Location (centered, aligned with first line)
  const projectLocation = clientData.projectLocation || '';
  if (projectLocation) {
    const centerX = pageWidth / 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const projectText = `Project Location: ${projectLocation}`;
    const projectWidth = doc.getTextWidth(projectText);
    doc.text(projectText, centerX - projectWidth / 2, clientYPos);
  }
  
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
  
  const clientPhone = clientData.mobileNumber || clientData.phone || clientData.customerPhone || '';
  if (clientPhone) {
    doc.text(`Phone Number: ${clientPhone}`, marginLeft + 3, clientYPos);
    clientYPos += 4;
  }
  
  doc.text(`GST Number: ${clientData.gstNumber || clientData.customerGST || '-'}`, marginLeft + 3, clientYPos);

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
  const refText = `Rf No.: ${displayQuotationNumber}`;
  const refWidth = doc.getTextWidth(refText);
  doc.text(refText, pageWidth - marginRight - refWidth - 3, rightYPos);
  
  rightYPos += 4;
  const attenText = `Atten: ${clientData.attention || '-'}`;
  const attenWidth = doc.getTextWidth(attenText);
  doc.text(attenText, pageWidth - marginRight - attenWidth - 3, rightYPos);

  yPos = boxStartY + boxHeight + 5;

  // Draw footer on first page (before any autoTable)
  drawFooter(doc, pageWidth, pageHeight, activeLogos);

  // ─── PRODUCTS TABLES ──────────────────────────────────────────────────────

  for (const room of enrichedRooms) {
    // Check if we need a new page for this room
    // If less than 50mm space remaining, start new page
    const spaceNeeded = 50; // Room title + header rows + at least 2 product rows
    const spaceRemaining = (pageHeight - 35) - yPos; // 35mm reserved for footer
    
    if (spaceRemaining < spaceNeeded) {
      doc.addPage();
      // Draw header and footer on new page
      yPos = drawHeader(doc, logoBase64, pageWidth, pageHeight);
      drawFooter(doc, pageWidth, pageHeight, activeLogos);
    }
    
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
      for (let index = 0; index < products.length; index++) {
        const item = products[index];
        const baseRate = parseFloat(item.rate ?? item.unitPrice ?? 0); // MRP
        const discountPercent = parseFloat(item.discountPercent ?? 0);
        const discountedRate = calcDiscountedRate(item); // Your Price (after discount)
        const quantity = parseInt(item.quantity ?? 1);
        const amount = discountedRate * quantity;

        const itemName = item.productName || item.description || '';
        const company = item.companyName || '';
        
        // Show only company name (no variant)
        const itemText = [itemName, company].filter(Boolean).join('\n');

        // Load product image with aggressive compression (max 80x80px, 40% quality)
        // Falls back to company logo if product image fails or is missing
        let imageData = null;
        const companyNameLower = (item.companyName || '').toLowerCase();

        // Map company names to their logo files
        const companyLogoMap = {
          'kohler'    : '/company-logos/Kohler.png',
          'jaguar'    : '/company-logos/Jaguar.png',
          'artize'    : '/company-logos/Artize.png',
          'duravit'   : '/company-logos/Duravit.png',
          'johnson'   : '/company-logos/Johnson.png',
          'kajaria'   : '/company-logos/Kajaria.png',
          'milagro'   : '/company-logos/Milagro.png',
          'parryware' : '/company-logos/Parryware.png',
          'qutone'    : '/company-logos/Qutone.png',
          'simero'    : '/company-logos/Simero.png',
          'simpolo'   : '/company-logos/Simpolo.png',
          'trueblock' : '/company-logos/TrueBlock.png',
          'woven'     : '/company-logos/Woven.png',
        };

        const matchedLogoKey = Object.keys(companyLogoMap).find(k => companyNameLower.includes(k));
        const fallbackLogoPath = matchedLogoKey ? companyLogoMap[matchedLogoKey] : null;

        if (item.image || item.images) {
          const imagePath = item.image || (Array.isArray(item.images) && item.images[0]);
          if (imagePath) {
            const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `https://dumy-2-mli2.onrender.com${imagePath}`;
            imageData = await loadImageAsBase64(imageUrl, 80, 80, 0.4);
          }
        }

        // If product image failed or missing, use company logo as fallback
        if (!imageData && fallbackLogoPath) {
          const logoOriginFallback = typeof window !== 'undefined' ? window.location.origin : '';
          imageData = await loadImageAsBase64(`${logoOriginFallback}${fallbackLogoPath}`, 80, 80, 0.6);
        }

        // Format prices with metadata for custom rendering
        const mrpFormatted = {
          content: `Rs. ${baseRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          styles: { halign: 'left' }
        };
        const yourPriceFormatted = {
          content: `Rs. ${discountedRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          styles: { halign: 'left' }
        };
        const discountFormatted = {
          content: `${discountPercent.toFixed(1)}%`,
          styles: { halign: 'center' }
        };
        const totalFormatted = {
          content: `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          styles: { halign: 'left' }
        };

        // Build row based on column format
        let rowData = [];
        
        // For the first product in an area, add the area name with rowSpan
        if (index === 0) {
          rowData.push(serialNumber.toString());
          rowData.push({ content: areaName.toUpperCase(), rowSpan: products.length, styles: { valign: 'middle', halign: 'center' } });
          if (columnFormat !== 'format7') {
            rowData.push(imageData ? { content: '', styles: { cellPadding: 0 } } : '');
          }
          rowData.push(itemText);
          rowData.push(quantity.toString());
          rowData.push(mrpFormatted);
          
          // Add columns based on format
          if (columnFormat === 'format1') {
            // Format 1: SR | AREA | IMAGE | ITEM | QTY | MRP | YOUR PRICE | TOTAL
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format2') {
            // Format 2: SR | AREA | IMAGE | ITEM | QTY | MRP | DISCOUNT | TOTAL
            rowData.push(discountFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format3') {
            // Format 3: SR | AREA | IMAGE | ITEM | QTY | MRP | DISC% | FINAL PRICE | TOTAL
            rowData.push(discountFormatted);
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format4') {
            // Format 4: SR | AREA | IMAGE | ITEM | QTY | MRP | TOTAL (GST in subtotal)
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format5') {
            // Format 5: SR | AREA | IMAGE | ITEM | QTY | MRP | YOUR PRICE | TOTAL (GST in subtotal)
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format6') {
            // Format 6: SR | AREA | IMAGE | ITEM | QTY | MRP | DISC% | YOUR PRICE | TOTAL (GST in subtotal)
            rowData.push(discountFormatted);
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format7') {
            // Format 7: SR | AREA | ITEM | QTY | MRP | YOUR PRICE | TOTAL (no images)
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          }
        } else {
          rowData.push(serialNumber.toString());
          if (columnFormat !== 'format7') {
            rowData.push(imageData ? { content: '', styles: { cellPadding: 0 } } : '');
          }
          rowData.push(itemText);
          rowData.push(quantity.toString());
          rowData.push(mrpFormatted);
          
          // Add columns based on format
          if (columnFormat === 'format1') {
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format2') {
            rowData.push(discountFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format3') {
            rowData.push(discountFormatted);
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format4') {
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format5') {
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format6') {
            rowData.push(discountFormatted);
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          } else if (columnFormat === 'format7') {
            rowData.push(yourPriceFormatted);
            rowData.push(totalFormatted);
          }
        }
        
        tableData.push(rowData);
        
        // Store image data and company line for later use in didDrawCell
        if (imageData) {
          tableData[tableData.length - 1]._imageData = imageData;
        }
        if (company) {
          tableData[tableData.length - 1]._companyLine = company;
        }
        
        serialNumber++;
      }
    }

    // Add subtotal row - SUBTOTAL label in second-to-last column, amount in TOTAL column
    let subtotalColspan = 6; // Default (SR, AREA, IMAGE, ITEM, QTY, MRP = 6 cols)
    if (columnFormat === 'format1') subtotalColspan = 6; // SR, AREA, IMAGE, ITEM, QTY, MRP = 6 cols
    else if (columnFormat === 'format2') subtotalColspan = 6; // SR, AREA, IMAGE, ITEM, QTY, MRP = 6 cols
    else if (columnFormat === 'format3') subtotalColspan = 7; // SR, AREA, IMAGE, ITEM, QTY, MRP, DISC% = 7 cols
    else if (columnFormat === 'format4') subtotalColspan = 5; // SR, AREA, IMAGE, ITEM, QTY, MRP = 6 cols (but no extra column)
    else if (columnFormat === 'format5') subtotalColspan = 6; // SR, AREA, IMAGE, ITEM, QTY, MRP = 6 cols
    else if (columnFormat === 'format6') subtotalColspan = 7; // SR, AREA, IMAGE, ITEM, QTY, MRP, DISC% = 7 cols
    else if (columnFormat === 'format7') subtotalColspan = 5; // SR, AREA, ITEM, QTY, MRP = 5 cols (no IMAGE)
    
    tableData.push([
      { content: '', colSpan: subtotalColspan, styles: { halign: 'right' } },
      { content: 'SUBTOTAL:', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `Rs. ${room.calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', halign: 'right' } },
    ]);
    
    // Add GST breakdown rows for formats 4, 5, 6
    if (columnFormat === 'format4' || columnFormat === 'format5' || columnFormat === 'format6') {
      const gstRate = quotationData.gstRate || 18; // Default to 18% if not provided
      const divisor = 100 + gstRate;
      const taxableAmount = (room.calculatedTotal / divisor) * 100;
      const gstAmount = room.calculatedTotal - taxableAmount;
      
      // Taxable Amount row
      tableData.push([
        { content: '', colSpan: subtotalColspan, styles: { halign: 'right' } },
        { content: 'Taxable Amount:', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `Rs. ${taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ]);
      
      // GST row
      tableData.push([
        { content: '', colSpan: subtotalColspan, styles: { halign: 'right' } },
        { content: `GST @${gstRate}%:`, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `Rs. ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ]);
    }

    // Draw table
    const availableWidth = pageWidth - marginLeft - marginRight;
    
    // Build table headers based on column format
    let tableHeaders = [];
    let columnStyles = {};
    
    if (columnFormat === 'format1') {
      // Format 1: SR | AREA | IMAGE | ITEM | QTY | MRP | YOUR PRICE | TOTAL
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'YOUR PRICE', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },
        1: { cellWidth: availableWidth * 0.10, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.12, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.28, halign: 'left' },
        4: { cellWidth: availableWidth * 0.07, halign: 'center' },
        5: { cellWidth: availableWidth * 0.12, halign: 'left' },
        6: { cellWidth: availableWidth * 0.13, halign: 'left' },
        7: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    } else if (columnFormat === 'format2') {
      // Format 2: SR | AREA | IMAGE | ITEM | QTY | MRP | DISCOUNT | TOTAL
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'DISCOUNT', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },
        1: { cellWidth: availableWidth * 0.10, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.12, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.28, halign: 'left' },
        4: { cellWidth: availableWidth * 0.07, halign: 'center' },
        5: { cellWidth: availableWidth * 0.12, halign: 'left' },
        6: { cellWidth: availableWidth * 0.13, halign: 'center' },
        7: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    } else if (columnFormat === 'format3') {
      // Format 3: SR | AREA | IMAGE | ITEM | QTY | MRP | DISC% | FINAL PRICE | TOTAL
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'DISC%', 'FINAL PRICE', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.04, halign: 'center' },
        1: { cellWidth: availableWidth * 0.09, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.10, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.25, halign: 'left' },
        4: { cellWidth: availableWidth * 0.06, halign: 'center' },
        5: { cellWidth: availableWidth * 0.12, halign: 'left' },
        6: { cellWidth: availableWidth * 0.08, halign: 'center' },
        7: { cellWidth: availableWidth * 0.13, halign: 'left' },
        8: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    } else if (columnFormat === 'format4') {
      // Format 4: SR | AREA | IMAGE | ITEM | QTY | MRP | TOTAL (GST in subtotal)
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },
        1: { cellWidth: availableWidth * 0.10, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.12, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.35, halign: 'left' },
        4: { cellWidth: availableWidth * 0.08, halign: 'center' },
        5: { cellWidth: availableWidth * 0.15, halign: 'left' },
        6: { cellWidth: availableWidth * 0.15, halign: 'right' },
      };
    } else if (columnFormat === 'format5') {
      // Format 5: SR | AREA | IMAGE | ITEM | QTY | MRP | YOUR PRICE | TOTAL (GST in subtotal)
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'YOUR PRICE', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },
        1: { cellWidth: availableWidth * 0.10, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.12, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.28, halign: 'left' },
        4: { cellWidth: availableWidth * 0.07, halign: 'center' },
        5: { cellWidth: availableWidth * 0.12, halign: 'left' },
        6: { cellWidth: availableWidth * 0.13, halign: 'left' },
        7: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    } else if (columnFormat === 'format6') {
      // Format 6: SR | AREA | IMAGE | ITEM | QTY | MRP | DISC% | YOUR PRICE | TOTAL (GST in subtotal)
      tableHeaders = ['SR', 'AREA', 'IMAGE', 'ITEM', 'QTY', 'MRP', 'DISC%', 'YOUR PRICE', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.04, halign: 'center' },
        1: { cellWidth: availableWidth * 0.09, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.10, halign: 'center', cellPadding: 0 },
        3: { cellWidth: availableWidth * 0.25, halign: 'left' },
        4: { cellWidth: availableWidth * 0.06, halign: 'center' },
        5: { cellWidth: availableWidth * 0.12, halign: 'left' },
        6: { cellWidth: availableWidth * 0.08, halign: 'center' },
        7: { cellWidth: availableWidth * 0.13, halign: 'left' },
        8: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    } else if (columnFormat === 'format7') {
      // Format 7: SR | AREA | ITEM | QTY | MRP | YOUR PRICE | TOTAL (no images)
      tableHeaders = ['SR', 'AREA', 'ITEM', 'QTY', 'MRP', 'YOUR PRICE', 'TOTAL'];
      columnStyles = {
        0: { cellWidth: availableWidth * 0.05, halign: 'center' },
        1: { cellWidth: availableWidth * 0.12, halign: 'center', valign: 'middle' },
        2: { cellWidth: availableWidth * 0.40, halign: 'left' },
        3: { cellWidth: availableWidth * 0.08, halign: 'center' },
        4: { cellWidth: availableWidth * 0.13, halign: 'left' },
        5: { cellWidth: availableWidth * 0.13, halign: 'left' },
        6: { cellWidth: availableWidth * 0.13, halign: 'right' },
      };
    }
    
    doc.autoTable({
      startY: yPos,
      margin: { left: marginLeft, right: marginRight, top: 40, bottom: 35 }, // Reserve space for header/footer
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      tableWidth: availableWidth,
      rowPageBreak: 'avoid', // Prevent rows from breaking across pages
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [249, 249, 249],
        textColor: [50, 50, 50],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        lineColor: [200, 200, 200],
      },
      columnStyles: columnStyles,
      willDrawCell: function(data) {
        // Determine column indices based on format
        let itemColumnIndex, priceColumnIndices;
        
        if (columnFormat === 'format1') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6, 7]; // MRP, YOUR PRICE, TOTAL
        } else if (columnFormat === 'format2') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7]; // MRP, TOTAL (DISCOUNT is %)
        } else if (columnFormat === 'format3') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7, 8]; // MRP, FINAL PRICE, TOTAL (DISC% is %)
        } else if (columnFormat === 'format4') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6]; // MRP, TOTAL
        } else if (columnFormat === 'format5') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6, 7]; // MRP, YOUR PRICE, TOTAL
        } else if (columnFormat === 'format6') {
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7, 8]; // MRP, YOUR PRICE, TOTAL (DISC% is %)
        } else if (columnFormat === 'format7') {
          itemColumnIndex = 2; // No IMAGE column, so ITEM is at index 2
          priceColumnIndices = [4, 5, 6]; // MRP, YOUR PRICE, TOTAL
        }
        
        // Custom rendering for ITEM column - prevent default rendering of company line
        const rowData = tableData[data.row.index];
        if (data.column.index === itemColumnIndex && data.section === 'body') {
          const companyLine = rowData._companyLine;
          
          if (companyLine && data.cell.text && data.cell.text.length > 1) {
            // Store the original lines
            data.cell._originalLines = [...data.cell.text];
            // Keep only the first line (product name) for default rendering
            data.cell.text = [data.cell.text[0]];
          }
        }
        
        // Custom rendering for price columns - prevent default text rendering
        if (priceColumnIndices.includes(data.column.index) && data.section === 'body') {
          const cell = data.cell;
          const text = typeof cell.raw === 'object' ? cell.raw.content : (cell.text && cell.text[0]);
          
          if (text && !text.includes('SUBTOTAL') && !text.includes('Taxable') && !text.includes('GST')) {
            const parts = text.split(' ');
            if (parts.length >= 2 && parts[0] === 'Rs.') {
              // Clear text to prevent default rendering
              cell.text = [];
            }
          }
        }
      },
      didDrawCell: function(data) {
        // Determine column indices based on format
        let imageColumnIndex, itemColumnIndex, priceColumnIndices;
        
        if (columnFormat === 'format1') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6, 7]; // MRP, YOUR PRICE, TOTAL
        } else if (columnFormat === 'format2') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7]; // MRP, TOTAL
        } else if (columnFormat === 'format3') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7, 8]; // MRP, FINAL PRICE, TOTAL
        } else if (columnFormat === 'format4') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6]; // MRP, TOTAL
        } else if (columnFormat === 'format5') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 6, 7]; // MRP, YOUR PRICE, TOTAL
        } else if (columnFormat === 'format6') {
          imageColumnIndex = 2;
          itemColumnIndex = 3;
          priceColumnIndices = [5, 7, 8]; // MRP, YOUR PRICE, TOTAL
        } else if (columnFormat === 'format7') {
          imageColumnIndex = -1; // No IMAGE column
          itemColumnIndex = 2;
          priceColumnIndices = [4, 5, 6]; // MRP, YOUR PRICE, TOTAL
        }
        
        // Draw product images in the IMAGE column
        const rowData = tableData[data.row.index];
        if (data.column.index === imageColumnIndex && data.section === 'body') {
          const rowData = tableData[data.row.index];
          // Check if this row has image data stored and is not a subtotal row
          if (rowData && rowData._imageData && !rowData[0]?.content?.includes('SUBTOTAL')) {
            try {
              const cell = data.cell;
              const imageData = rowData._imageData;
              
              // Get image properties from jsPDF
              const imgProps = doc.getImageProperties(imageData);
              const imgWidth = imgProps.width;
              const imgHeight = imgProps.height;
              const imgAspectRatio = imgWidth / imgHeight;
              
              // Minimal padding
              const padding = 0.5;
              const availableWidth = cell.width - (padding * 2);
              const availableHeight = cell.height - (padding * 2);
              const cellAspectRatio = availableWidth / availableHeight;
              
              let finalWidth, finalHeight, imageX, imageY;
              
              // Compare aspect ratios to determine how to fit the image
              if (imgAspectRatio > cellAspectRatio) {
                // Image is wider relative to cell - fit to width
                finalWidth = availableWidth;
                finalHeight = availableWidth / imgAspectRatio;
                imageX = cell.x + padding;
                imageY = cell.y + (cell.height - finalHeight) / 2;
              } else {
                // Image is taller relative to cell - fit to height
                finalHeight = availableHeight;
                finalWidth = availableHeight * imgAspectRatio;
                imageX = cell.x + (cell.width - finalWidth) / 2;
                imageY = cell.y + padding;
              }
              
              // Draw the image with proper aspect ratio
              doc.addImage(imageData, 'JPEG', imageX, imageY, finalWidth, finalHeight);
            } catch (err) {
              console.warn('Failed to draw product image in PDF:', err);
              // Fallback: try to draw with basic sizing
              try {
                const padding = 2;
                const size = Math.min(cell.width, cell.height) - (padding * 2);
                const x = cell.x + (cell.width - size) / 2;
                const y = cell.y + (cell.height - size) / 2;
                doc.addImage(imageData, 'JPEG', x, y, size, size);
              } catch (fallbackErr) {
                console.warn('Fallback image drawing also failed:', fallbackErr);
              }
            }
          }
        }
        
        // Custom rendering for ITEM column - draw company in blue
        if (data.column.index === itemColumnIndex && data.section === 'body') {
          const rowData = tableData[data.row.index];
          const companyLine = rowData._companyLine;
          
          if (companyLine && data.cell._originalLines && data.cell._originalLines.length > 1) {
            const cell = data.cell;
            
            // Set font for company line (blue color)
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(37, 99, 235); // Blue color (matching the header blue)
            
            // Calculate Y position for the second line
            // The first line was drawn by autoTable, we need to position below it
            const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
            const padding = 2;
            const firstLineY = cell.y + padding + (lineHeight * 0.7);
            const secondLineY = firstLineY + lineHeight;
            
            // Draw the company line in blue
            doc.text(companyLine, cell.x + padding, secondLineY);
            
            // Reset color to black for other text
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          }
        }
        
        // Custom rendering for price columns
        if (priceColumnIndices.includes(data.column.index) && data.section === 'body') {
          const cell = data.cell;
          const text = typeof cell.raw === 'object' ? cell.raw.content : (cell.text && cell.text[0]);
          
          if (!text || text.includes('SUBTOTAL')) return;
          
          const parts = text.split(' ');
          if (parts.length >= 2 && parts[0] === 'Rs.') {
            // Set font
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Align with QTY column - position from top of cell
            const textY = cell.y + 3.5; // Adjusted to align with QTY text
            
            // Draw "Rs." on the left
            doc.text('Rs.', cell.x + 2, textY);
            
            // Draw number on the right
            const number = parts.slice(1).join(' ');
            const numberWidth = doc.getTextWidth(number);
            doc.text(number, cell.x + cell.width - numberWidth - 2, textY);
          }
        }
      },
      didDrawPage: function(data) {
        // Draw header on pages after the first
        if (data.pageNumber > 1) {
          drawHeader(doc, logoBase64, pageWidth, pageHeight);
        }
        // Draw footer on ALL pages including first page
        drawFooter(doc, pageWidth, pageHeight, activeLogos);
      }
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
    // Check if we need a new page for summary
    const spaceNeeded = 40; // Space for summary table
    const spaceRemaining = (pageHeight - 35) - yPos;
    
    if (spaceRemaining < spaceNeeded) {
      doc.addPage();
      yPos = drawHeader(doc, logoBase64, pageWidth, pageHeight);
      drawFooter(doc, pageWidth, pageHeight, activeLogos);
    }
    
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
      margin: { left: marginLeft, right: marginRight, top: 40, bottom: 35 },
      head: [['SR.NO.', 'BATHROOM', 'AMOUNT']],
      body: summaryData,
      theme: 'grid',
      tableWidth: summaryAvailableWidth,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        lineColor: [200, 200, 200],
      },
      columnStyles: {
        0: { cellWidth: summaryAvailableWidth * 0.15, halign: 'center' },
        1: { cellWidth: summaryAvailableWidth * 0.60, halign: 'center' },
        2: { cellWidth: summaryAvailableWidth * 0.25, halign: 'right' },
      },
      didDrawPage: function(data) {
        if (data.pageNumber > 1) {
          drawHeader(doc, logoBase64, pageWidth, pageHeight);
        }
        drawFooter(doc, pageWidth, pageHeight, activeLogos);
      }
    });

    yPos = doc.lastAutoTable.finalY + 5;
  }

  // ─── TERMS & CONDITIONS ───────────────────────────────────────────────────

  // Check if we need a new page for terms
  const termsSpaceNeeded = 30; // Space for terms section
  const termsSpaceRemaining = (pageHeight - 35) - yPos;
  
  if (termsSpaceRemaining < termsSpaceNeeded) {
    doc.addPage();
    yPos = drawHeader(doc, logoBase64, pageWidth, pageHeight);
    drawFooter(doc, pageWidth, pageHeight, activeLogos);
  }

  // Store the starting Y position for both sections
  const termsStartY = yPos;
  
  // Left side - TERMS & CONDITIONS
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TERMS & CONDITIONS', marginLeft, termsStartY);
  
  // Right side - ATTENDED BY (aligned with TERMS & CONDITIONS header)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ATTENDED BY:', pageWidth - marginRight - 40, termsStartY);
  
  // Now start content for both sides at the same Y position
  let contentYPos = termsStartY + 5;
  
  // Left side - Terms content
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '1. PAYMENT ADVANCE ALONG WITH ORDER',
    '2. RATES ARE INCLUSIVE OF GST',
    '3. CARTING EXTRA',
    '4. DELIVERY WITHIN A WEEK',
  ];
  
  let termsYPos = contentYPos;
  terms.forEach((term) => {
    doc.text(term, marginLeft + 5, termsYPos);
    termsYPos += 4;
  });

  // Right side - Attended by content (starts at same Y as first term)
  let attendedYPos = contentYPos;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  if (attendedByStaffId) {
    doc.text(`${attendedByStaffId} - ${attendedByName}`, pageWidth - marginRight - 40, attendedYPos);
  } else {
    doc.text(attendedByName, pageWidth - marginRight - 40, attendedYPos);
  }
  attendedYPos += 4;
  
  // Three staff members (aligned with terms 2, 3, 4)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 0, 0); // Red color for names
  doc.text('Paras Shah : ', pageWidth - marginRight - 40, attendedYPos);
  doc.setTextColor(0, 0, 0); // Black color for phone numbers
  doc.text('92272 06063', pageWidth - marginRight - 40 + doc.getTextWidth('Paras Shah : '), attendedYPos);
  attendedYPos += 4;
  
  doc.setTextColor(255, 0, 0); // Red color for names
  doc.text('Hemang Shah : ', pageWidth - marginRight - 40, attendedYPos);
  doc.setTextColor(0, 0, 0); // Black color for phone numbers
  doc.text('98250 24763', pageWidth - marginRight - 40 + doc.getTextWidth('Hemang Shah : '), attendedYPos);
  attendedYPos += 4;
  
  doc.setTextColor(255, 0, 0); // Red color for names
  doc.text('Harshal Shah : ', pageWidth - marginRight - 40, attendedYPos);
  doc.setTextColor(0, 0, 0); // Black color for phone numbers
  doc.text('99792 31820', pageWidth - marginRight - 40 + doc.getTextWidth('Harshal Shah : '), attendedYPos);
  
  // Reset text color to black
  doc.setTextColor(0, 0, 0);
  
  // Update yPos to the maximum of both sections
  yPos = Math.max(termsYPos, attendedYPos);

  // Footer is now drawn by didDrawPage callback on all pages

  // ─── SAVE PDF ─────────────────────────────────────────────────────────────

  // Generate filename based on revision number and room name
  let filename = `Quotation-${quotationNumber}`;
  if (revisionNumber) {
    const roomName = roomsData.length === 1 ? roomsData[0].name.replace(/\s+/g, '-') : 'Multiple';
    filename = `Quotation-${quotationNumber}-Revised-${revisionNumber}-${roomName}`;
  }
  
  // Log PDF info before saving
  const pdfBlob = doc.output('blob');
  const pdfSizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(2);
  console.log(`📄 PDF Generated: ${filename}.pdf - Size: ${pdfSizeMB}MB`);
  
  doc.save(`${filename}.pdf`);
  
  } catch (error) {
    console.error('Error generating PDF:', error);
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
    throw error;
  }
}

export default QuotationPDFGenerator;
