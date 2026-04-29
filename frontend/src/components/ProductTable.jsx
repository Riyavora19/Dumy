import './ProductTable.css';

function ProductTable({ items, products, loading, onItemChange, onRemoveRow, onAddRow }) {
  return (
    <div className="product-table">
      <div className="product-table__header">
        <h3>Products</h3>
        <button
          type="button"
          className="product-table__add-btn"
          onClick={onAddRow}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Row
        </button>
      </div>

      <div className="product-table__container">
        <table className="product-table__table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Rate (₹)</th>
              <th>Amount (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <select
                    value={item.productId}
                    onChange={(e) => onItemChange(item.id, 'productId', e.target.value)}
                    className="product-table__select"
                    disabled={loading}
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {product.variant}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange(item.id, 'quantity', e.target.value)}
                    min="1"
                    step="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="product-table__input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => onItemChange(item.id, 'rate', e.target.value)}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="product-table__input"
                  />
                </td>
                <td>
                  <span className="product-table__amount">
                    ₹{(item.amount || 0).toFixed(2)}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="product-table__delete-btn"
                    onClick={() => onRemoveRow(item.id)}
                    title="Delete row"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="product-table__loading">
          Loading products...
        </div>
      )}
    </div>
  );
}

export default ProductTable;
