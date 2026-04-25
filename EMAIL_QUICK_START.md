# 📧 Email Quick Start - 5 Minutes Setup

## ⚡ Fastest Way to Enable Email (Gmail)

### Step 1: Get Gmail App Password (2 minutes)
1. Go to: https://myaccount.google.com/apppasswords
2. If asked, enable 2-Factor Authentication first
3. Select "Mail" → "Other (Custom name)"
4. Enter "Quotation System"
5. Click "Generate"
6. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Update .env File (1 minute)
Open `backend/.env` and replace these lines:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Your Company Name <your-email@gmail.com>
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `abcd efgh ijkl mnop` → The 16-character password you copied (remove spaces)
- `Your Company Name` → Your business name

**Example:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=interiordesign@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=ABC Interiors <interiordesign@gmail.com>
```

### Step 3: Restart Backend (30 seconds)
```bash
# Stop current server (Ctrl+C in terminal)
# Start again
cd backend
node server.js
```

### Step 4: Test It! (1 minute)
1. Go to Admin Panel → Live Requests
2. Click "Send Quote" on any request
3. Fill quotation form
4. Click "Send Quotation to Client"
5. Check your email inbox!

---

## ✅ Success Indicators

**Email sent successfully:**
- ✅ Success message: "Email sent to: client@email.com"
- ✅ Backend console shows: "Email sent successfully"
- ✅ Client receives professional HTML email

**Email failed:**
- ❌ Warning: "Email could not be sent"
- ❌ Check backend console for error details
- ❌ Verify .env configuration

---

## 🎯 What Happens When You Send Quotation

1. **Admin clicks "Send Quotation"**
2. **System saves quotation** to database
3. **System sends professional email** to client with:
   - Beautiful HTML template
   - All items with prices
   - Terms and conditions
   - Grand total
   - Valid until date
4. **Client receives email** in their inbox
5. **Admin sees success message**

---

## 📧 Email Preview

The client will receive a professional email with:

```
┌─────────────────────────────────────┐
│         QUOTATION                   │
│      Request #REQ26040001           │
├─────────────────────────────────────┤
│ Dear Client Name,                   │
│                                     │
│ Thank you for your interest...      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ITEMS TABLE                     │ │
│ │ Product 1    Qty: 2  ₹10,000   │ │
│ │ Product 2    Qty: 1  ₹5,000    │ │
│ │                                 │ │
│ │ Subtotal:           ₹15,000    │ │
│ │ Tax (18%):          ₹2,700     │ │
│ │ Grand Total:        ₹17,700    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Payment Terms: 50% advance          │
│ Delivery: 2-3 weeks                 │
│ Warranty: 1 year                    │
│ Valid Until: May 25, 2026           │
│                                     │
│        [Contact Us Button]          │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problem: "Invalid login: Username and Password not accepted"
**Solution:**
- Use App Password, NOT your regular Gmail password
- Remove spaces from App Password
- Make sure 2FA is enabled on Gmail

### Problem: "Connection timeout"
**Solution:**
- Check internet connection
- Verify EMAIL_HOST is `smtp.gmail.com`
- Verify EMAIL_PORT is `587`

### Problem: Email goes to spam
**Solution:**
- Ask client to check spam folder
- Mark as "Not Spam"
- Add your email to contacts

### Problem: "Email could not be sent" but quotation saved
**Solution:**
- Quotation is saved successfully
- Email failed to send
- Check .env configuration
- Restart backend server

---

## 🎓 Gmail Limits

**Free Gmail Account:**
- 500 emails per day
- Perfect for small businesses
- No cost

**Need more?**
- Use SendGrid (100 emails/day free)
- Use Mailgun (5,000 emails/month free)
- See EMAIL_SETUP_GUIDE.md for details

---

## 📝 Configuration Template

Copy this to your `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernapp
JWT_SECRET=your-secret-key-change-this-in-production-2024

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Your Company Name <your-email@gmail.com>
```

---

## ✨ Features

✅ Professional HTML email template
✅ Automatic email sending
✅ Beautiful purple gradient design
✅ Responsive layout (mobile-friendly)
✅ All quotation details included
✅ Terms and conditions
✅ Contact button
✅ Error handling
✅ Success notifications

---

## 🚀 Next Steps

After email is working:

1. **Test with real client** - Send a test quotation
2. **Customize template** - Edit `backend/services/emailService.js`
3. **Add company logo** - Include in email header
4. **Set up domain email** - Use your@yourdomain.com instead of Gmail
5. **Monitor delivery** - Check if clients receive emails

---

## 💡 Pro Tips

1. **Test with your own email first** before sending to clients
2. **Check spam folder** if email doesn't arrive in 1-2 minutes
3. **Save App Password securely** - You won't see it again
4. **Use professional email address** - Looks more trustworthy
5. **Customize EMAIL_FROM** - Use your company name

---

## 📞 Need Help?

1. Check backend console for error messages
2. Verify all .env values are correct
3. Make sure no spaces in App Password
4. Restart backend server after changes
5. See EMAIL_SETUP_GUIDE.md for detailed troubleshooting

---

**That's it! You're ready to send professional quotations via email! 🎉**

Last Updated: April 25, 2026
