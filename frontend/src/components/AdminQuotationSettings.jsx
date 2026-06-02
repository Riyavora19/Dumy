import { useState, useEffect } from 'react';
import './AdminQuotationSettings.css';

const AdminQuotationSettings = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Separate active and inactive logos
  const activeLogos = logos.filter(logo => logo.active);
  const inactiveLogos = logos.filter(logo => !logo.active);
  
  console.log('Active logos:', activeLogos.length, activeLogos);
  console.log('Inactive logos:', inactiveLogos.length, inactiveLogos);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Fetching from:', `${API_URL}/quotation-settings`);
      
      const response = await fetch(`${API_URL}/quotation-settings`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Fetched logos:', data.data.footerLogos);
        setLogos(data.data.footerLogos || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!formData.get('logo').name) {
      return;
    }

    if (!formData.get('name')) {
      return;
    }

    if (logos.length >= 13) {
      return;
    }

    setUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/quotation-settings/upload-logo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Logo uploaded successfully');
        fetchSettings();
        e.target.reset();
      } else {
        alert(data.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/quotation-settings/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
      } else {
        alert(data.message || 'Failed to remove logo');
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      alert('Failed to remove logo');
    }
  };

  const handleActivate = async (id) => {
    if (activeLogos.length >= 13) {
      alert('Maximum 13 logos allowed. Remove a logo first.');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/quotation-settings/activate/${id}`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
      } else {
        alert(data.message || 'Failed to add logo');
      }
    } catch (error) {
      console.error('Error adding logo:', error);
      alert('Failed to add logo');
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/quotation-settings/permanent/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
      } else {
        alert(data.message || 'Failed to delete logo');
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      alert('Failed to delete logo');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === index) return;

    const newLogos = [...activeLogos];
    const draggedLogo = newLogos[draggedItem];
    
    newLogos.splice(draggedItem, 1);
    newLogos.splice(index, 0, draggedLogo);
    
    // Update the full logos array
    const updatedLogos = [...newLogos, ...inactiveLogos];
    setLogos(updatedLogos);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/quotation-settings/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logos: [...activeLogos, ...inactiveLogos] })
      });

      const data = await response.json();
      
      if (data.success) {
        setLogos(data.data);
      } else {
        alert(data.message || 'Failed to reorder logos');
        fetchSettings(); // Reload to reset order
      }
    } catch (error) {
      console.error('Error reordering logos:', error);
      alert('Failed to reorder logos');
      fetchSettings(); // Reload to reset order
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-quotation-settings">
      <div className="settings-header">
        <h2>📄 Quotation Settings</h2>
        <p>Manage company logos that appear in quotation footer (Maximum 13 logos)</p>
      </div>

      <div className="settings-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Add New Logo</h3>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Logo Name:</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Kohler"
                required
                disabled={logos.length >= 13}
              />
            </div>
            <div className="form-group">
              <label>Logo Image:</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                required
                disabled={logos.length >= 13}
              />
            </div>
            <button 
              type="submit" 
              className="btn-upload" 
              disabled={uploading || logos.length >= 13}
            >
              {uploading ? 'Uploading...' : '📤 Upload Logo'}
            </button>
            {logos.length >= 13 && (
              <p className="warning-text">Maximum 13 logos reached. Delete a logo to add new one.</p>
            )}
          </form>
        </div>

        {/* Active Logos Grid */}
        <div className="logos-section">
          <h3>Active Logos in Quotation ({activeLogos.length}/13)</h3>
          <p className="drag-hint">💡 Drag and drop to reorder logos</p>
          
          <div className="logos-grid">
            {activeLogos.map((logo, index) => (
              <div
                key={logo.id}
                className={`logo-card ${draggedItem === index ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="logo-order">#{logo.order}</div>
                <div className="logo-image-container">
                  <img
                    src={logo.path}
                    alt={logo.name}
                    className="logo-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x80?text=No+Image';
                    }}
                  />
                </div>
                <div className="logo-name">{logo.name}</div>
                <button
                  className="btn-delete-logo"
                  onClick={() => handleDelete(logo.id)}
                  title="Remove from quotation"
                >
                  ➖ Remove
                </button>
              </div>
            ))}
          </div>

          {activeLogos.length === 0 && (
            <div className="empty-state">
              <p>No logos in quotation. Add logos from the available logos below.</p>
            </div>
          )}
        </div>

        {/* Inactive/Available Logos */}
        {inactiveLogos.length > 0 && (
          <div className="logos-section">
            <h3>Available Logos ({inactiveLogos.length})</h3>
            <p className="drag-hint">Click "Add to Quotation" to use these logos</p>
            
            <div className="logos-grid">
              {inactiveLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="logo-card logo-card-inactive"
                >
                  <div className="logo-image-container">
                    <img
                      src={logo.path}
                      alt={logo.name}
                      className="logo-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x80?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="logo-name">{logo.name}</div>
                  <button
                    className="btn-add-logo"
                    onClick={() => handleActivate(logo.id)}
                    title="Add to quotation"
                    disabled={activeLogos.length >= 13}
                  >
                    ➕ Add to Quotation
                  </button>
                  {logo.path.startsWith('/uploads/') && (
                    <button
                      className="btn-permanent-delete"
                      onClick={() => handlePermanentDelete(logo.id)}
                      title="Delete permanently"
                    >
                      🗑️ Delete Forever
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="preview-section">
          <h3>Footer Preview</h3>
          <p className="preview-hint">This is how logos will appear in the quotation PDF footer</p>
          <div className="footer-preview">
            {activeLogos.length === 0 ? (
              <div className="preview-empty">
                <p>No logos to preview. Add logos to see the footer preview.</p>
              </div>
            ) : (
              <>
                <div className="preview-logos-row">
                  {activeLogos.slice(0, 7).map((logo) => {
                    console.log('Rendering logo in preview:', logo.name, logo.path);
                    return (
                      <div key={logo.id} className="preview-logo-wrapper">
                        <img
                          src={logo.path}
                          alt={logo.name}
                          className="preview-logo"
                          title={logo.name}
                          onLoad={() => console.log('Logo loaded:', logo.name)}
                          onError={(e) => {
                            console.error('Logo failed to load:', logo.name, logo.path);
                            e.target.style.border = '2px solid red';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {activeLogos.length > 7 && (
                  <div className="preview-logos-row">
                    {activeLogos.slice(7, 13).map((logo) => (
                      <div key={logo.id} className="preview-logo-wrapper">
                        <img
                          src={logo.path}
                          alt={logo.name}
                          className="preview-logo"
                          title={logo.name}
                          onLoad={() => console.log('Logo loaded:', logo.name)}
                          onError={(e) => {
                            console.error('Logo failed to load:', logo.name, logo.path);
                            e.target.style.border = '2px solid red';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuotationSettings;
