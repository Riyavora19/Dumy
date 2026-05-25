import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import AdminBudgetPlanForm from './AdminBudgetPlanForm';
import QuotationList from './QuotationList';
import './AdminQuotations.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminQuotations() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      // For now, we'll use localStorage since backend quotation endpoint might not exist
      const savedQuotations = localStorage.getItem('quotations');
      if (savedQuotations) {
        setQuotations(JSON.parse(savedQuotations));
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      showNotification('Failed to fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuotation = (quotationData) => {
    try {
      const newQuotation = {
        id: editingQuotation?.id || Date.now().toString(),
        ...quotationData,
        createdAt: editingQuotation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedQuotations;
      if (editingQuotation) {
        updatedQuotations = quotations.map(q => q.id === editingQuotation.id ? newQuotation : q);
        showNotification('Quotation updated successfully!', 'success');
      } else {
        updatedQuotations = [newQuotation, ...quotations];
        showNotification('Quotation created successfully!', 'success');
      }

      setQuotations(updatedQuotations);
      localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      setShowForm(false);
      setEditingQuotation(null);
    } catch (error) {
      console.error('Error saving quotation:', error);
      showNotification('Failed to save quotation', 'error');
    }
  };

  const handleDeleteQuotation = (id) => {
    const updatedQuotations = quotations.filter(q => q.id !== id);
    setQuotations(updatedQuotations);
      localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      showNotification('Quotation deleted successfully!', 'success');
    }
  };

  const handleEditQuotation = (quotation) => {
    setEditingQuotation(quotation);
    setShowForm(true);
  };

  return (
    <div className="admin-quotations">
      {!showForm ? (
        <>
          <div className="admin-quotations__header">
            <div>
              <h1>📋 Quotations</h1>
              <p>Manage and create quotations for clients</p>
            </div>
            <button 
              className="admin-quotations__create-btn"
              onClick={() => {
                setEditingQuotation(null);
                setShowForm(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New Quotation
            </button>
          </div>

          {loading ? (
            <div className="admin-quotations__loading">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="admin-quotations__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h2>No Quotations Yet</h2>
              <p>Create your first quotation to get started</p>
              <button 
                className="admin-quotations__create-btn"
                onClick={() => setShowForm(true)}
              >
                Create New Quotation
              </button>
            </div>
          ) : (
            <QuotationList 
              quotations={quotations}
              onEdit={handleEditQuotation}
              onDelete={handleDeleteQuotation}
            />
          )}
        </>
      ) : (
        <AdminBudgetPlanForm 
          onClose={() => {
            setShowForm(false);
            setEditingQuotation(null);
          }}
          onSuccess={(quotationData) => {
            handleSaveQuotation(quotationData);
          }}
        />
      )}
    </div>
  );
}

export default AdminQuotations;
