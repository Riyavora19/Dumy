# Combined View & Quotation Modal - Implementation Guide

## What Changed

The "View Request" and "Send Quotation" modals have been combined into a single modal that shows:
1. **Request Details** (always visible at top)
2. **Quotation Form** (toggleable - shown when user clicks "Send Quotation" button)

## Key Changes Made

### 1. State Variables Updated
- Removed: `sendingQuote`
- Added: `showQuotationForm` (boolean to toggle quotation form visibility)
- Kept: `viewingRequest` (now handles both viewing and quotation)

### 2. Functions Updated
- `handleView()` - Now prepares both request details AND quotation data
- `closeModal()` - Resets `showQuotationForm` to false
- Removed: `handleSendQuote()` - functionality merged into `handleView()`
- `handleQuoteSubmit()` - Uses `viewingRequest` instead of `sendingQuote`

### 3. UI Changes
- Table actions: Removed separate "Send Quote" button
- "View" button now opens combined modal
- Modal shows request details at top
- "Send Quotation" button at bottom toggles quotation form

## How It Works

1. **User clicks "View" button** on any request
   - Opens modal with request details
   - Quotation form is hidden initially
   - Quotation data is pre-prepared in background

2. **User clicks "Send Quotation" button** in modal
   - Quotation form slides down/appears
   - Items are already pre-filled from budget plan (if applicable)
   - User can edit items, prices, terms

3. **User submits quotation**
   - Saves to database
   - Sends email to client
   - Closes modal

## Benefits

✅ Single modal = less clicking
✅ See request details while creating quotation
✅ Better workflow - all info in one place
✅ Cleaner UI - one less button in table

## Current Status

The code has been partially updated. To complete the implementation, the modal JSX needs to be replaced with the combined version.

The combined modal structure should be:

```jsx
{viewingRequest && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h2>Request #{viewingRequest.requestNumber}</h2>
        <button onClick={closeModal}>×</button>
      </div>

      {/* Request Details - Always Visible */}
      <div className="request-details">
        <div className="client-info">...</div>
        <div className="request-info">...</div>
        <div className="status-info">...</div>
        <div className="budget-info">...</div>
      </div>

      {/* Toggle Button */}
      {!showQuotationForm && (
        <button onClick={() => setShowQuotationForm(true)}>
          📧 Send Quotation
        </button>
      )}

      {/* Quotation Form - Toggleable */}
      {showQuotationForm && (
        <form onSubmit={handleQuoteSubmit}>
          <div className="quotation-items">...</div>
          <div className="quotation-terms">...</div>
          <div className="quotation-summary">...</div>
          <button type="submit">Send to Client</button>
        </form>
      )}
    </div>
  </div>
)}
```

## Next Steps

The backend code is ready. The frontend needs the modal JSX to be updated with the combined structure shown above.

Would you like me to:
1. Complete the modal replacement automatically?
2. Provide you with the exact code to copy-paste?
3. Create a new component file with the combined modal?

Let me know your preference!
