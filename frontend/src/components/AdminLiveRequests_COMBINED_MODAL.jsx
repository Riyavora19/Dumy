      {/* Combined View & Send Quote Modal */}
      {viewingRequest && (
        <div className="admin-live-requests__modal-overlay" onClick={closeModal}>
          <div className="admin-live-requests__modal admin-live-requests__modal--combined" onClick={(e) => e.stopPropagation()}>
            <div className="admin-live-requests__modal-header">
              <h2>📋 Request Details - {viewingRequest.requestNumber}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            {/* Request Information Section */}
            <div className="admin-live-requests__quote-info">
              <div className="quote-client-info">
                <h3>📞 Client Information</h3>
                <p><strong>Name:</strong> {viewingRequest.clientName}</p>
                <p><strong>Email:</strong> {viewingRequest.clientEmail}</p>
                <p><strong>Phone:</strong> {viewingRequest.clientPhone}</p>
              </div>
              <div className="quote-request-info">
                <h3>📝 Request Details</h3>
                <p><strong>Title:</strong> {viewingRequest.title}</p>
                <p><strong>Type:</strong> {getRequestTypeIcon(viewingRequest.requestType)} {viewingRequest.requestType}</p>
                <p><strong>Status:</strong> {getStatusBadge(viewingRequest.status)}</p>
                <p><strong>Urgency:</strong> {getUrgencyBadge(viewingRequest.urgency)}</p>
                {viewingRequest.budget && (
                  <p><strong>Client Budget:</strong> ₹{viewingRequest.budget.min?.toLocaleString('en-IN')} - ₹{viewingRequest.budget.max?.toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="admin-live-requests__view-section" style={{ margin: '20px 30px', padding: '15px', background: '#f7fafc', borderRadius: '8px' }}>
              <h3>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingRequest.description}</p>
            </div>

            {/* Toggle Quotation Form Button */}
            {!showQuotationForm && (
              <div style={{ padding: '0 30px 20px 30px', textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setShowQuotationForm(true)}
                  className="admin-live-requests__btn-submit"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 40px', fontSize: '16px' }}
                >
                  📧 Send Quotation to Client
                </button>
                <button 
                  type="button"
                  onClick={() => { closeModal(); handleEdit(viewingRequest); }}
                  className="admin-live-requests__btn-cancel"
                  style={{ marginLeft: '15px', padding: '15px 40px' }}
                >
                  ✏️ Edit Request
                </button>
              </div>
            )}

            {/* Quotation Form - Shown when button clicked */}
            {showQuotationForm && (
              <form onSubmit={handleQuoteSubmit} className="admin-live-requests__quote-form">
                
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', margin: '0 30px' }}>
                  <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Create Quotation</h2>
                </div>

                {/* Items Section */}
                <div className="quotation-items-section">
                  <div className="section-header">
                    <h3>🛒 Quotation Items</h3>
                    <button type="button" onClick={handleAddItem} className="btn-add-item">
                      + Add Item
                    </button>
                  </div>

                  <div className="quotation-items-table">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Description</th>
                          <th style={{ width: '15%' }}>Quantity</th>
                          <th style={{ width: '20%' }}>Unit Price (₹)</th>
                          <th style={{ width: '20%' }}>Total (₹)</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteData.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="e.g., Premium Toilet Seat - Kohler"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="1"
                                step="1"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                              />
                            </td>
                            <td>
                              <strong>₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </td>
                            <td>
                              {quoteData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="btn-remove-item"
                                  title="Remove item"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="subtotal-row">
                          <td colSpan="3" style={{ textAlign: 'right' }}><strong>Subtotal:</strong></td>
                          <td colSpan="2"><strong>₹{quoteData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                        <tr className="tax-row">
                          <td colSpan="2" style={{ textAlign: 'right' }}>
                            <strong>Tax:</strong>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={quoteData.taxPercentage}
                              onChange={(e) => handleTaxChange(e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              style={{ width: '80px' }}
                            /> %
                          </td>
                          <td colSpan="2"><strong>₹{quoteData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                        <tr className="grand-total-row">
                          <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
                          <td colSpan="2"><strong>₹{quoteData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="quotation-terms-section">
                  <h3>📜 Terms & Conditions</h3>
                  
                  <div className="admin-live-requests__row">
                    <div className="admin-live-requests__field">
                      <label>Payment Terms *</label>
                      <input
                        type="text"
                        value={quoteData.paymentTerms}
                        onChange={(e) => setQuoteData({ ...quoteData, paymentTerms: e.target.value })}
                        required
                        placeholder="e.g., 50% advance, 50% on completion"
                      />
                    </div>

                    <div className="admin-live-requests__field">
                      <label>Delivery Timeline *</label>
                      <input
                        type="text"
                        value={quoteData.deliveryTimeline}
                        onChange={(e) => setQuoteData({ ...quoteData, deliveryTimeline: e.target.value })}
                        required
                        placeholder="e.g., 2-3 weeks"
                      />
                    </div>
                  </div>

                  <div className="admin-live-requests__row">
                    <div className="admin-live-requests__field">
                      <label>Warranty *</label>
                      <input
                        type="text"
                        value={quoteData.warranty}
                        onChange={(e) => setQuoteData({ ...quoteData, warranty: e.target.value })}
                        required
                        placeholder="e.g., 1 year manufacturer warranty"
                      />
                    </div>

                    <div className="admin-live-requests__field">
                      <label>Valid Until *</label>
                      <input
                        type="date"
                        value={quoteData.validUntil}
                        onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="admin-live-requests__field">
                    <label>Additional Notes</label>
                    <textarea
                      value={quoteData.notes}
                      onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                      rows="3"
                      placeholder="Installation charges, transportation, special conditions, etc."
                    />
                  </div>
                </div>

                {/* Quote Summary */}
                <div className="quote-summary">
                  <h3>📊 Quotation Summary</h3>
                  <div className="summary-row">
                    <span>Total Items:</span>
                    <strong>{quoteData.items.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <strong>₹{quoteData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({quoteData.taxPercentage}%):</span>
                    <strong>₹{quoteData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.5)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>Grand Total:</span>
                    <strong style={{ fontSize: '1.5rem' }}>₹{quoteData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Valid Until:</span>
                    <strong>{quoteData.validUntil}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Client Email:</span>
                    <strong>{viewingRequest.clientEmail}</strong>
                  </div>
                </div>

                <div className="admin-live-requests__modal-actions">
                  <button type="button" onClick={() => setShowQuotationForm(false)} className="admin-live-requests__btn-cancel">
                    ← Back to Request Details
                  </button>
                  <button type="submit" className="admin-live-requests__btn-submit admin-live-requests__btn-send-quote">
                    📧 Send Quotation to Client
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
