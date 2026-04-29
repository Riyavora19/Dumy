import { createContext, useContext, useState, useRef } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const recentNotifications = useRef(new Map());

  const showNotification = (message, type = 'success', duration = 3000) => {
    const key = `${message}-${type}`;
    const now = Date.now();
    
    // Check if this exact notification was shown recently (within 500ms)
    const lastShown = recentNotifications.current.get(key);
    if (lastShown && (now - lastShown) < 500) {
      console.log('🚫 Duplicate notification prevented:', message);
      return;
    }
    
    // Update the last shown time for this notification
    recentNotifications.current.set(key, now);
    
    // Clean up old entries (older than 1 second)
    for (const [k, time] of recentNotifications.current.entries()) {
      if (now - time > 1000) {
        recentNotifications.current.delete(k);
      }
    }
    
    const id = Date.now() + Math.random();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification--${notification.type}`}
        >
          <div className="notification__icon">
            {notification.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            )}
          </div>
          <span className="notification__message">{notification.message}</span>
          <button
            className="notification__close"
            onClick={() => onClose(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
