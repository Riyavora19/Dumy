import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BudgetPlanner.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

function BudgetPlanner() {
  const navigate = useNavigate();
  const [roomTemplates, setRoomTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoomTemplates();
  }, []);

  const fetchRoomTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/room-templates`);
      const data = await response.json();
      setRoomTemplates(data);
    } catch (err) {
      console.error('Error fetching room templates:', err);
      setError('Failed to load room templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (templateId) => {
    navigate(`/budget-planner/${templateId}`);
  };

  if (loading) {
    return (
      <main className="budget-planner-page">
        <div className="loading">Loading room templates...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="budget-planner-page">
        <div className="error">{error}</div>
      </main>
    );
  }

  return (
    <main className="budget-planner-page">
      <div className="budget-planner-container">
        <header className="planner-header">
          <h1>🏠 Plan Your Room</h1>
          <p>Select a room type and set your budget to get personalized product recommendations</p>
        </header>

        <section className="room-templates-grid">
          {roomTemplates.map((template) => (
            <div 
              key={template._id} 
              className="room-template-card"
              onClick={() => handleSelectRoom(template._id)}
            >
              <div className="template-icon">{template.icon}</div>
              <h3>{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <div className="budget-range">
                <span className="label">Budget Range:</span>
                <span className="range">
                  ₹{(template.estimatedBudget.min / 1000).toFixed(0)}k - 
                  ₹{(template.estimatedBudget.max / 1000).toFixed(0)}k
                </span>
              </div>
              {template.estimatedBudget.recommended && (
                <div className="recommended-budget">
                  <span className="label">Recommended:</span>
                  <span className="amount">₹{(template.estimatedBudget.recommended / 1000).toFixed(0)}k</span>
                </div>
              )}
              <div className="items-count">
                {template.requiredItems.length} items to configure
              </div>
              <button className="select-btn">
                Plan This Room →
              </button>
            </div>
          ))}
        </section>

        {roomTemplates.length === 0 && (
          <div className="no-templates">
            <p>No room templates available yet.</p>
            <p>Please contact admin to add room templates.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default BudgetPlanner;
