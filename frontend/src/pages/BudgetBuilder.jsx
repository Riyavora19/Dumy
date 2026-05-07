import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './BudgetBuilder.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function BudgetBuilder() {
  const { showNotification } = useNotification();
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [budget, setBudget] = useState(50000);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching template:', templateId);
      
      const response = await fetch(`${API_URL}/room-templates/${templateId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Room template not found. Please go back and select a template again.');
          console.error('❌ Template not found:', templateId);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Template loaded:', data.name);
      setTemplate(data);
      
      // Set budget with safety checks
      if (data.estimatedBudget) {
        setBudget(data.estimatedBudget.recommended || data.estimatedBudget.min || 50000);
      } else {
        setBudget(50000);
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Failed to load room template. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      console.log('🔍 Generating recommendations for:', {
        templateId,
        budget,
        apiUrl: API_URL
      });
      
      const response = await fetch(`${API_URL}/budget-plans/generate-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTemplateId: templateId,
          budget: budget
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to generate recommendations: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Recommendations received:', data);
      setRecommendations(data);
      
      // Auto-select first budget option for each item
      const autoSelected = {};
      data.recommendations.forEach(rec => {
        if (rec.products.budget.length > 0) {
          autoSelected[rec.itemType._id] = {
            product: rec.products.budget[0],
            quantity: rec.quantity.min
          };
        } else if (rec.products.midRange.length > 0) {
          autoSelected[rec.itemType._id] = {
            product: rec.products.midRange[0],
            quantity: rec.quantity.min
          };
        } else if (rec.products.all.length > 0) {
          autoSelected[rec.itemType._id] = {
            product: rec.products.all[0],
            quantity: rec.quantity.min
          };
        }
      });
      setSelectedProducts(autoSelected);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleProductSelect = (itemTypeId, product, quantity = 1) => {
    setSelectedProducts(prev => ({
      ...prev,
      [itemTypeId]: { product, quantity }
    }));
  };

  const calculateTotalCost = () => {
    return Object.values(selectedProducts).reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSavePlan = async () => {
    try {
      const totalCost = calculateTotalCost();
      
      // Get user information from localStorage if logged in
      const userToken = localStorage.getItem('userToken');
      const userInfo = localStorage.getItem('userInfo');
      let userData = {};
      
      if (userToken && userInfo) {
        try {
          const user = JSON.parse(userInfo);
          userData = {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone || ''
          };
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
      
      const planData = {
        roomTemplate: templateId,
        roomName: template.name,
        totalBudget: budget,
        selectedProducts: Object.entries(selectedProducts).map(([itemTypeId, data]) => ({
          itemType: itemTypeId,
          itemName: data.product.itemTypeName || data.product.name,
          product: data.product._id,
          productName: data.product.name,
          company: data.product.company?._id,
          companyName: data.product.company?.name,
          quantity: data.quantity,
          unitPrice: data.product.price,
          totalPrice: data.product.price * data.quantity
        })),
        totalCost,
        status: 'draft',
        ...userData // Add user information if available
      };

      const response = await fetch(`${API_URL}/budget-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      const savedPlan = await response.json();
      
      // Save plan ID to localStorage for user to access later
      const savedPlanIds = JSON.parse(localStorage.getItem('myBudgetPlans') || '[]');
      if (!savedPlanIds.includes(savedPlan._id)) {
        savedPlanIds.push(savedPlan._id);
        localStorage.setItem('myBudgetPlans', JSON.stringify(savedPlanIds));
      }
      
      showNotification('Budget plan saved successfully!', 'success');
      // Navigate to My Budget Plans page to see the saved plan
      navigate('/my-budget-plans');
    } catch (err) {
      console.error('Error saving plan:', err);
      showNotification('Failed to save plan. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <main className="budget-builder-page">
        <div className="loading">Loading...</div>
      </main>
    );
  }

  if (error && !template) {
    return (
      <main className="budget-builder-page">
        <div className="error-container">
          <div className="error">{error}</div>
          <button className="back-btn" onClick={() => navigate('/budget-planner')}>
            ← Go Back to Budget Planner
          </button>
        </div>
      </main>
    );
  }

  const totalCost = calculateTotalCost();
  const remainingBudget = budget - totalCost;

  return (
    <main className="budget-builder-page">
      <div className="budget-builder-container">
        <header className="builder-header">
          <button className="back-btn" onClick={() => navigate('/budget-planner')}>
            ← Back
          </button>
          <div className="header-content">
            <h1>{template.icon} {template.name}</h1>
            <p>{template.description}</p>
          </div>
        </header>

        <section className="budget-input-section">
          <div className="budget-card">
            <h2>Set Your Budget</h2>
            <div className="budget-slider-container">
              <input
                type="range"
                min={template?.estimatedBudget?.min || 10000}
                max={template?.estimatedBudget?.max || 500000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="budget-slider"
              />
              <div className="budget-display">
                <span className="budget-amount">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <div className="budget-range-labels">
                <span>₹{((template?.estimatedBudget?.min || 10000) / 1000).toFixed(0)}k</span>
                <span>₹{((template?.estimatedBudget?.max || 500000) / 1000).toFixed(0)}k</span>
              </div>
            </div>
            <button 
              className="generate-btn"
              onClick={generateRecommendations}
              disabled={generating}
            >
              {generating ? 'Generating...' : '✨ Generate Recommendations'}
            </button>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        {recommendations && (
          <>
            <section className="recommendations-section">
              <h2>Product Recommendations</h2>
              {recommendations.recommendations.map((rec) => (
                <div key={rec.itemType._id} className="item-recommendation">
                  <div className="item-header">
                    <h3>
                      {rec.itemType.icon} {rec.itemName}
                      {rec.isEssential && <span className="essential-badge">Essential</span>}
                    </h3>
                    <div className="suggested-budget">
                      Suggested: ₹{rec.suggestedBudget.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="products-grid">
                    {rec.products.all.length === 0 ? (
                      <div className="no-products">
                        No products available for this item type from our partner companies.
                      </div>
                    ) : (
                      rec.products.all.slice(0, 6).map((product) => (
                        <div
                          key={product._id}
                          className={`product-card ${
                            selectedProducts[rec.itemType._id]?.product._id === product._id
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => handleProductSelect(rec.itemType._id, product, rec.quantity.min)}
                        >
                          <div className="product-image">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`} 
                                alt={product.name} 
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/400x300/f5f5f5/cccccc?text=No+Image';
                                }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: '#f5f5f5' }}></div>
                            )}
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <p className="company-name">{product.company?.name || 'Unknown'}</p>
                            <p className="variant">{product.variant}</p>
                            <div className="product-price">
                              <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                              {product.rating > 0 && (
                                <span className="rating">⭐ {product.rating.toFixed(1)}</span>
                              )}
                            </div>
                          </div>
                          {selectedProducts[rec.itemType._id]?.product._id === product._id && (
                            <div className="selected-indicator">✓ Selected</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </section>

            <section className="summary-section">
              <div className="summary-card">
                <h2>Budget Summary</h2>
                <div className="summary-row">
                  <span>Total Budget:</span>
                  <span className="amount">₹{budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Selected Products:</span>
                  <span className="amount">₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className={`summary-row total ${remainingBudget < 0 ? 'over-budget' : ''}`}>
                  <span>Remaining:</span>
                  <span className="amount">₹{remainingBudget.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  className="save-plan-btn"
                  onClick={handleSavePlan}
                  disabled={Object.keys(selectedProducts).length === 0}
                >
                  💾 Save Budget Plan
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default BudgetBuilder;
