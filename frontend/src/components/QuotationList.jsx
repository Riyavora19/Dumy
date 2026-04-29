import QuotationPDFGenerator from './QuotationPDFGenerator';
import './QuotationList.css';

function QuotationList({ quotations, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGeneratePDF = (quotation) => {
    QuotationPDFGenerator(quotation);
  };

  return (
    <div className="quotation-list">
      <div className="quotation-list__container">
        <table className="quotation-list__table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Client Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="quotation-list__number">
                  {quotation.quotationNumber}
                </td>
                <td>
                  <strong>{quotation.clientData.clientName}</strong>
                </td>
                <td>
                  {quotation.clientData.companyName || '-'}
                </td>
                <td>
                  <a href={`mailto:${quotation.clientData.email}`}>
                    {quotation.clientData.email}
                  </a>
                </td>
                <td className="quotation-list__amount">
                  ₹{quotation.total.toFixed(2)}
                </td>
                <td>
                  {formatDate(quotation.quotationDate)}
                </td>
                <td>
                  <div className="quotation-list__actions">
                    <button
                      className="quotation-list__btn quotation-list__btn--view"
                      onClick={() => handleGeneratePDF(quotation)}
                      title="Generate PDF"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </button>
                    <button
                      className="quotation-list__btn quotation-list__btn--edit"
                      onClick={() => onEdit(quotation)}
                      title="Edit quotation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="quotation-list__btn quotation-list__btn--delete"
                      onClick={() => onDelete(quotation.id)}
                      title="Delete quotation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuotationList;
