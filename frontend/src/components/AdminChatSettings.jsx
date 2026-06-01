import { useState, useEffect } from 'react';
import './AdminChatSettings.css';
import axios from '../utils/axios';

const AdminChatSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/chat-settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await axios.put('/chat-settings', settings);
      if (response.data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    const days = [...settings.businessHours.days];
    const index = days.indexOf(day);
    
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
      days.sort((a, b) => a - b);
    }
    
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        days
      }
    });
  };

  if (loading) {
    return (
      <div className="admin-chat-settings__loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-chat-settings__error">
        <p>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="admin-chat-settings">
      <div className="admin-chat-settings__header">
        <h2>Chat Settings</h2>
        <p>Configure auto-responses and business hours</p>
      </div>

      {message && (
        <div className={`admin-chat-settings__message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-chat-settings__content">
        {/* Auto-Response Toggle */}
        <div className="admin-chat-settings__section">
          <div className="admin-chat-settings__section-header">
            <h3>Auto-Response</h3>
            <label className="admin-chat-settings__toggle">
              <input
                type="checkbox"
                checked={settings.autoResponseEnabled}
                onChange={(e) => setSettings({ ...settings, autoResponseEnabled: e.target.checked })}
              />
              <span className="admin-chat-settings__toggle-slider"></span>
            </label>
          </div>
          <p className="admin-chat-settings__description">
            Enable automatic responses when admin doesn't reply within the specified time
          </p>
        </div>

        {/* Auto-Response Delay */}
        {settings.autoResponseEnabled && (
          <div className="admin-chat-settings__section">
            <h3>Auto-Response Delay</h3>
            <p className="admin-chat-settings__description">
              Time to wait before sending auto-response (if admin doesn't reply)
            </p>
            <div className="admin-chat-settings__input-group">
              <input
                type="number"
                min="5"
                max="300"
                value={settings.autoResponseDelay}
                onChange={(e) => setSettings({ ...settings, autoResponseDelay: parseInt(e.target.value) })}
                className="admin-chat-settings__input"
              />
              <span className="admin-chat-settings__input-suffix">seconds</span>
            </div>
            <p className="admin-chat-settings__hint">
              Recommended: 30-60 seconds. This gives you time to respond before auto-response kicks in.
            </p>
          </div>
        )}

        {/* Business Hours */}
        <div className="admin-chat-settings__section">
          <div className="admin-chat-settings__section-header">
            <h3>Business Hours</h3>
            <label className="admin-chat-settings__toggle">
              <input
                type="checkbox"
                checked={settings.businessHoursEnabled}
                onChange={(e) => setSettings({ ...settings, businessHoursEnabled: e.target.checked })}
              />
              <span className="admin-chat-settings__toggle-slider"></span>
            </label>
          </div>
          <p className="admin-chat-settings__description">
            Send offline message outside business hours instead of waiting for delay
          </p>
        </div>

        {/* Business Hours Configuration */}
        {settings.businessHoursEnabled && (
          <>
            <div className="admin-chat-settings__section">
              <h3>Working Hours</h3>
              <div className="admin-chat-settings__time-inputs">
                <div className="admin-chat-settings__time-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={settings.businessHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      businessHours: { ...settings.businessHours, start: e.target.value }
                    })}
                    className="admin-chat-settings__input"
                  />
                </div>
                <div className="admin-chat-settings__time-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={settings.businessHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      businessHours: { ...settings.businessHours, end: e.target.value }
                    })}
                    className="admin-chat-settings__input"
                  />
                </div>
              </div>
            </div>

            <div className="admin-chat-settings__section">
              <h3>Working Days</h3>
              <div className="admin-chat-settings__days">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    className={`admin-chat-settings__day ${
                      settings.businessHours.days.includes(day.value) ? 'active' : ''
                    }`}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-chat-settings__section">
              <h3>Offline Message</h3>
              <p className="admin-chat-settings__description">
                Message sent to customers outside business hours
              </p>
              <textarea
                value={settings.offlineMessage}
                onChange={(e) => setSettings({ ...settings, offlineMessage: e.target.value })}
                className="admin-chat-settings__textarea"
                rows="4"
              />
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="admin-chat-settings__actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-chat-settings__save-btn"
          >
            {saving ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="admin-chat-settings__info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div>
            <strong>How it works:</strong>
            <ul>
              <li><strong>During business hours:</strong> Auto-response waits for the delay period. If you reply within that time, no auto-response is sent.</li>
              <li><strong>Outside business hours:</strong> Offline message is sent immediately (if business hours are enabled).</li>
              <li><strong>Auto-response disabled:</strong> No automatic messages are sent. You must reply manually to all messages.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatSettings;
