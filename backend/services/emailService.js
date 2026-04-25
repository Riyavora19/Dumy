const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send quotation email
const sendQuotationEmail = async (quotationData) => {
  try {
    const transporter = createTransporter();

    const {
      clientName,
      clientEmail,
      requestNumber,
      items,
      subtotal,
      taxPercentage,
      taxAmount,
      grandTotal,
      paymentTerms,
      deliveryTimeline,
      warranty,
      validUntil,
      notes
    } = quotationData;

    // Format items for email
    const itemsHtml = items.map((item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left;">${index + 1}</td>
        <td style="padding: 12px; text-align: left;">${item.description}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₹${parseFloat(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">₹${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation - ${requestNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Quotation</h1>
              <p style="margin: 10px 0 0 0; color: #e6e6ff; font-size: 16px;">Request #${requestNumber}</p>
            </td>
          </tr>

          <!-- Client Info -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Dear ${clientName},</h2>
              <p style="margin: 0 0 15px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in our products and services. We are pleased to provide you with the following quotation:
              </p>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #667eea; color: #ffffff;">
                    <th style="padding: 15px; text-align: left; font-weight: 600; width: 40px;">#</th>
                    <th style="padding: 15px; text-align: left; font-weight: 600;">Description</th>
                    <th style="padding: 15px; text-align: center; font-weight: 600; width: 80px;">Qty</th>
                    <th style="padding: 15px; text-align: right; font-weight: 600; width: 120px;">Unit Price</th>
                    <th style="padding: 15px; text-align: right; font-weight: 600; width: 120px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; text-align: right; color: #4a5568; font-size: 16px;">Subtotal:</td>
                  <td style="padding: 10px 0 10px 20px; text-align: right; color: #2d3748; font-size: 16px; font-weight: 600; width: 150px;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; text-align: right; color: #4a5568; font-size: 16px;">Tax (${taxPercentage}%):</td>
                  <td style="padding: 10px 0 10px 20px; text-align: right; color: #2d3748; font-size: 16px; font-weight: 600;">₹${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 15px 0 0 0; text-align: right; color: #2d3748; font-size: 20px; font-weight: 700;">Grand Total:</td>
                  <td style="padding: 15px 0 0 20px; text-align: right; color: #667eea; font-size: 24px; font-weight: 700;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Terms & Conditions -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #f7fafc;">
              <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 18px;">Terms & Conditions</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 14px; width: 150px;"><strong>Payment Terms:</strong></td>
                  <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${paymentTerms}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 14px;"><strong>Delivery Timeline:</strong></td>
                  <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${deliveryTimeline}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 14px;"><strong>Warranty:</strong></td>
                  <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${warranty}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 14px;"><strong>Valid Until:</strong></td>
                  <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${new Date(validUntil).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
              </table>
              ${notes ? `
              <div style="margin-top: 15px; padding: 15px; background-color: #ffffff; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;"><strong>Additional Notes:</strong><br>${notes}</p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px;">
                If you have any questions or would like to proceed with this quotation, please don't hesitate to contact us.
              </p>
              <a href="mailto:${process.env.EMAIL_FROM}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Us</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #2d3748; color: #a0aec0; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">Thank you for choosing our services!</p>
              <p style="margin: 0; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: clientEmail,
      subject: `Quotation for Your Request - ${requestNumber}`,
      html: emailHtml,
      text: `
Dear ${clientName},

Thank you for your interest in our products and services. Please find your quotation below:

Request Number: ${requestNumber}

ITEMS:
${items.map((item, index) => `${index + 1}. ${item.description} - Qty: ${item.quantity} × ₹${parseFloat(item.unitPrice).toLocaleString('en-IN')} = ₹${item.total.toLocaleString('en-IN')}`).join('\n')}

TOTALS:
Subtotal: ₹${subtotal.toLocaleString('en-IN')}
Tax (${taxPercentage}%): ₹${taxAmount.toLocaleString('en-IN')}
Grand Total: ₹${grandTotal.toLocaleString('en-IN')}

TERMS & CONDITIONS:
Payment Terms: ${paymentTerms}
Delivery Timeline: ${deliveryTimeline}
Warranty: ${warranty}
Valid Until: ${new Date(validUntil).toLocaleDateString('en-IN')}

${notes ? `Additional Notes:\n${notes}\n` : ''}

If you have any questions, please contact us at ${process.env.EMAIL_FROM}

Thank you for choosing our services!
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Quotation email sent successfully'
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send quotation email'
    };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid and ready to send emails');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendQuotationEmail,
  testEmailConfig
};
