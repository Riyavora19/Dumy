import jsPDF from 'jspdf';

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
  const title = 'PRODUCT IMAGES';
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
function drawFooter(doc, pageWidth, pageHeight) {
  const footerStartY = pageHeight - 30;
  
  // Company logos section (25mm height) - NO HEADER TEXT
  doc.setFillColor(249, 249, 249);
  doc.rect(0, footerStartY, pageWidth, 25, 'F');
  
  // Company logos grid - SMALLER WIDTH to prevent stretching
  const logos = [
    'Artize.png', 'Duravit.png', 'Jaguar.png', 'Johnson.png',
    'Kajaria.png', 'Kohler.png', 'Milagro.png', 'Parryware.png',
    'Qutone.png', 'Simero.png', 'Simpolo.png', 'TrueBlock.png', 'Woven.png'
  ];
  
  const logosPerRow = 7;
  const logoWidth = 15; // Reduced from 20 to 15 to prevent stretching
  const logoHeight = 8;
  const logoSpacing = 6;
  const startY = footerStartY + 5; // Start higher since no header text
  
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
  
  return footerStartY; // Return Y position where footer starts
}

async function generateImagesPDF(data) {
  try {
    const { products, quotationNumber, customerName, rooms } = data;

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Load company logo
    let logoBase64 = null;
    try {
      logoBase64 = await loadImageAsBase64('/gtss-logo.png');
    } catch (err) {
      console.warn('Failed to load company logo:', err);
    }

    // Grid settings
    const imagesPerRow = 3;
    const marginLeft = 10;
    const marginRight = 10;
    const headerHeight = 45; // Space reserved for header
    const footerHeight = 30; // Space reserved for footer
    const marginTop = headerHeight + 5; // Start content after header
    const marginBottom = footerHeight + 5; // End content before footer
    
    const imageWidth = (pageWidth - marginLeft - marginRight - 20) / imagesPerRow; // 20mm total gap between images
    const imageHeight = 35; // Reduced from 40 to 35 to fit 3 rows
    const nameHeight = 10; // Reduced from 12 to 10 for product name
    const cellHeight = imageHeight + nameHeight;
    const gap = 6; // Reduced gap from 8 to 6

    let isFirstPage = true;
    
    // Helper function to add header and footer to current page
    const addHeaderFooter = () => {
      drawHeader(doc, logoBase64, pageWidth, pageHeight);
      drawFooter(doc, pageWidth, pageHeight);
    };

    // If rooms data is provided, organize by rooms and areas
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        // Start new page for each room (except first)
        if (!isFirstPage) {
          doc.addPage();
        }
        
        // Add header and footer to this page
        addHeaderFooter();
        isFirstPage = false;

        let yPos = marginTop;

        // Room Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const roomTitle = room.name.toUpperCase();
        const roomTitleWidth = doc.getTextWidth(roomTitle);
        doc.text(roomTitle, (pageWidth - roomTitleWidth) / 2, yPos);

        yPos += 5; // Reduced from 6 to 5

        // Customer and Quotation info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${customerName || '-'}`, marginLeft, yPos);
        doc.text(`Quotation: ${quotationNumber}`, pageWidth - marginRight - doc.getTextWidth(`Quotation: ${quotationNumber}`), yPos);

        yPos += 5; // Reduced from 6 to 5

        // Draw a line
        doc.setDrawColor(200, 200, 200);
        doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);

        yPos += 5; // Reduced from 6 to 5

        // Process each area in the room
        for (const area of room.areas) {
          if (area.products.length === 0) continue;

          // Area Title
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(37, 99, 235); // Blue color
          doc.text(area.name.toUpperCase(), marginLeft, yPos);
          yPos += 5; // Reduced from 6 to 5

          let currentRow = 0;
          let currentCol = 0;

          for (let i = 0; i < area.products.length; i++) {
            const product = area.products[i];

            // Check if we need a new page
            if (yPos + cellHeight > pageHeight - marginBottom) {
              doc.addPage();
              addHeaderFooter(); // Add header and footer to new page
              yPos = marginTop;
              
              // Repeat room title on new page
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(0, 0, 0);
              doc.text(`${room.name.toUpperCase()} (continued)`, marginLeft, yPos);
              yPos += 8;
              
              // Repeat area title
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(37, 99, 235);
              doc.text(`${area.name.toUpperCase()} (continued)`, marginLeft, yPos);
              yPos += 8;
              
              currentRow = 0;
              currentCol = 0;
            }

            // Calculate position
            const xPos = marginLeft + currentCol * (imageWidth + gap);

            // Draw border around cell
            doc.setDrawColor(200, 200, 200);
            doc.rect(xPos, yPos, imageWidth, cellHeight);

            // Load and draw image
            const imagePath = product.image || (Array.isArray(product.images) && product.images[0]);
            if (imagePath) {
              const imageUrl = imagePath.startsWith('http') 
                ? imagePath 
                : `http://localhost:5000${imagePath}`;
              const imageData = await loadImageAsBase64(imageUrl);

              if (imageData) {
                try {
                  // Get image properties
                  const imgProps = doc.getImageProperties(imageData);
                  const imgWidth = imgProps.width;
                  const imgHeight = imgProps.height;
                  const imgAspectRatio = imgWidth / imgHeight;

                  // Calculate image dimensions to fit in the box
                  const padding = 5;
                  const availableWidth = imageWidth - (padding * 2);
                  const availableHeight = imageHeight - (padding * 2);
                  const cellAspectRatio = availableWidth / availableHeight;

                  let finalWidth, finalHeight, imageX, imageY;

                  if (imgAspectRatio > cellAspectRatio) {
                    // Image is wider - fit to width
                    finalWidth = availableWidth;
                    finalHeight = availableWidth / imgAspectRatio;
                    imageX = xPos + padding;
                    imageY = yPos + padding + (availableHeight - finalHeight) / 2;
                  } else {
                    // Image is taller - fit to height
                    finalHeight = availableHeight;
                    finalWidth = availableHeight * imgAspectRatio;
                    imageX = xPos + padding + (availableWidth - finalWidth) / 2;
                    imageY = yPos + padding;
                  }

                  // Draw the image
                  doc.addImage(imageData, 'JPEG', imageX, imageY, finalWidth, finalHeight);
                } catch (err) {
                  console.warn('Failed to draw image:', err);
                  // Draw "No Image" text
                  doc.setFontSize(10);
                  doc.setTextColor(150, 150, 150);
                  doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
                  doc.setTextColor(0, 0, 0);
                }
              } else {
                // Draw "No Image" text
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
                doc.setTextColor(0, 0, 0);
              }
            } else {
              // Draw "No Image" text
              doc.setFontSize(10);
              doc.setTextColor(150, 150, 150);
              doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
              doc.setTextColor(0, 0, 0);
            }

            // Draw product name below image
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            
            const nameYPos = yPos + imageHeight + 5;
            const productName = product.productName || product.name || 'Unknown Product';
            const variant = product.variant || '';
            const company = product.companyName || product.company || '';
            
            // Split text if too long
            const maxWidth = imageWidth - 10;
            const nameLines = doc.splitTextToSize(productName, maxWidth);
            const variantCompanyText = [variant, company].filter(Boolean).join(' | ');
            
            // Draw product name (first line only if multiple lines)
            doc.text(nameLines[0], xPos + imageWidth / 2, nameYPos, { align: 'center' });
            
            // Draw variant and company in smaller font
            if (variantCompanyText) {
              doc.setFontSize(9); // Increased from 7 to 9
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(100, 100, 100);
              const variantLines = doc.splitTextToSize(variantCompanyText, maxWidth);
              doc.text(variantLines[0], xPos + imageWidth / 2, nameYPos + 4, { align: 'center' });
              doc.setTextColor(0, 0, 0);
            }

            // Move to next position
            currentCol++;
            if (currentCol >= imagesPerRow) {
              currentCol = 0;
              currentRow++;
              yPos += cellHeight + gap;
            }
          }

          // Move to next row if current row is not complete
          if (currentCol > 0) {
            yPos += cellHeight + gap;
          }

          // Add space before next area
          yPos += 3; // Reduced from 5 to 3
        }
      }
    } else {
      // Fallback: No rooms, just show all products
      // Add header and footer to first page
      addHeaderFooter();
      
      let yPos = marginTop;

      // Room Title (since no rooms, use generic title)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const title = 'PRODUCT IMAGES';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, yPos);

      yPos += 8;

      // Customer and Quotation info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Customer: ${customerName || '-'}`, marginLeft, yPos);
      doc.text(`Quotation: ${quotationNumber}`, pageWidth - marginRight - doc.getTextWidth(`Quotation: ${quotationNumber}`), yPos);

      yPos += 10;

      // Draw a line
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);

      yPos += 10;

      let currentRow = 0;
      let currentCol = 0;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        // Check if we need a new page
        if (yPos + cellHeight > pageHeight - marginBottom) {
          doc.addPage();
          addHeaderFooter(); // Add header and footer to new page
          yPos = marginTop;
          currentRow = 0;
          currentCol = 0;
        }

        // Calculate position
        const xPos = marginLeft + currentCol * (imageWidth + gap);

        // Draw border around cell
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, yPos, imageWidth, cellHeight);

        // Load and draw image
        const imagePath = product.image || (Array.isArray(product.images) && product.images[0]);
        if (imagePath) {
          const imageUrl = imagePath.startsWith('http') 
            ? imagePath 
            : `http://localhost:5000${imagePath}`;
          const imageData = await loadImageAsBase64(imageUrl);

          if (imageData) {
            try {
              // Get image properties
              const imgProps = doc.getImageProperties(imageData);
              const imgWidth = imgProps.width;
              const imgHeight = imgProps.height;
              const imgAspectRatio = imgWidth / imgHeight;

              // Calculate image dimensions to fit in the box
              const padding = 5;
              const availableWidth = imageWidth - (padding * 2);
              const availableHeight = imageHeight - (padding * 2);
              const cellAspectRatio = availableWidth / availableHeight;

              let finalWidth, finalHeight, imageX, imageY;

              if (imgAspectRatio > cellAspectRatio) {
                // Image is wider - fit to width
                finalWidth = availableWidth;
                finalHeight = availableWidth / imgAspectRatio;
                imageX = xPos + padding;
                imageY = yPos + padding + (availableHeight - finalHeight) / 2;
              } else {
                // Image is taller - fit to height
                finalHeight = availableHeight;
                finalWidth = availableHeight * imgAspectRatio;
                imageX = xPos + padding + (availableWidth - finalWidth) / 2;
                imageY = yPos + padding;
              }

              // Draw the image
              doc.addImage(imageData, 'JPEG', imageX, imageY, finalWidth, finalHeight);
            } catch (err) {
              console.warn('Failed to draw image:', err);
              // Draw "No Image" text
              doc.setFontSize(10);
              doc.setTextColor(150, 150, 150);
              doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
              doc.setTextColor(0, 0, 0);
            }
          } else {
            // Draw "No Image" text
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          // Draw "No Image" text
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No Image', xPos + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }

        // Draw product name below image
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        
        const nameYPos = yPos + imageHeight + 5;
        const productName = product.name || 'Unknown Product';
        const variant = product.variant || '';
        const company = product.company || '';
        
        // Split text if too long
        const maxWidth = imageWidth - 10;
        const nameLines = doc.splitTextToSize(productName, maxWidth);
        const variantCompanyText = [variant, company].filter(Boolean).join(' | ');
        
        // Draw product name (first line only if multiple lines)
        doc.text(nameLines[0], xPos + imageWidth / 2, nameYPos, { align: 'center' });
        
        // Draw variant and company in smaller font
        if (variantCompanyText) {
          doc.setFontSize(9); // Increased from 7 to 9
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          const variantLines = doc.splitTextToSize(variantCompanyText, maxWidth);
          doc.text(variantLines[0], xPos + imageWidth / 2, nameYPos + 4, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }

        // Move to next position
        currentCol++;
        if (currentCol >= imagesPerRow) {
          currentCol = 0;
          currentRow++;
          yPos += cellHeight + gap;
        }
      }
    }

    // Save PDF
    doc.save(`Images-${quotationNumber}.pdf`);
  } catch (error) {
    console.error('Error generating images PDF:', error);
    throw error;
  }
}

export default generateImagesPDF;
