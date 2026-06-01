import { useState, useEffect, useRef } from 'react';
import './AdminChats.css';
import axios from '../utils/axios';

const AdminChats = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatSessions();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchChatSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      console.log('🔄 Fetching chat sessions...');
      const response = await axios.get('/chat/sessions/active');
      console.log('✅ Chat sessions response:', response.data);
      
      if (response.data.success) {
        setChatSessions(response.data.data);
        console.log('📊 Active sessions:', response.data.data.length);
        
        // Update selected session if it exists
        if (selectedSession) {
          const updated = response.data.data.find(
            s => s.sessionId === selectedSession.sessionId
          );
          if (updated) {
            setSelectedSession(updated);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching chat sessions:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedSession) return;

    try {
      const response = await axios.post('/chat/reply', {
        sessionId: selectedSession.sessionId,
        message: replyMessage
      });

      if (response.data.success) {
        setReplyMessage('');
        fetchChatSessions();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to close this chat session?')) {
      return;
    }

    try {
      const response = await axios.patch(`/chat/session/${sessionId}/close`);
      if (response.data.success) {
        fetchChatSessions();
        if (selectedSession?.sessionId === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('Error closing session:', error);
      alert('Failed to close session');
    }
  };

  const getUnreadCount = (session) => {
    if (!session.messages.length) return 0;
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.sender === 'user' ? 1 : 0;
  };

  if (loading) {
    return (
      <div className="admin-chats__loading">
        <div className="spinner"></div>
        <p>Loading chat sessions...</p>
      </div>
    );
  }

  return (
    <div className="admin-chats">
      <div className="admin-chats__header">
        <h2>Live Chat Support</h2>
        <div className="admin-chats__stats">
          <span className="stat">
            <strong>{chatSessions.length}</strong> Active Chats
          </span>
        </div>
      </div>

      <div className="admin-chats__container">
        {/* Chat Sessions List */}
        <div className="admin-chats__sidebar">
          <div className="admin-chats__sidebar-header">
            <h3>Chat Sessions</h3>
          </div>
          
          {chatSessions.length === 0 ? (
            <div className="admin-chats__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No active chat sessions</p>
            </div>
          ) : (
            <div className="admin-chats__sessions">
              {chatSessions.map((session) => (
                <div
                  key={session._id}
                  className={`admin-chats__session-item ${
                    selectedSession?.sessionId === session.sessionId ? 'active' : ''
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="admin-chats__session-avatar">
                    {session.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-chats__session-info">
                    <div className="admin-chats__session-name">
                      {session.userName}
                      {getUnreadCount(session) > 0 && (
                        <span className="admin-chats__unread-badge">New</span>
                      )}
                    </div>
                    <div className="admin-chats__session-email">{session.userEmail}</div>
                    <div className="admin-chats__session-preview">
                      {session.messages.length > 0
                        ? session.messages[session.messages.length - 1].text.substring(0, 40) + '...'
                        : 'No messages yet'}
                    </div>
                  </div>
                  <div className="admin-chats__session-time">
                    {new Date(session.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="admin-chats__main">
          {selectedSession ? (
            <>
              <div className="admin-chats__main-header">
                <div className="admin-chats__main-user">
                  <div className="admin-chats__main-avatar">
                    {selectedSession.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedSession.userName}</h3>
                    <p>{selectedSession.userEmail}</p>
                  </div>
                </div>
                <button
                  className="admin-chats__close-btn"
                  onClick={() => handleCloseSession(selectedSession.sessionId)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Close Chat
                </button>
              </div>

              <div className="admin-chats__messages">
                {selectedSession.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`admin-chats__message ${
                      message.sender === 'user'
                        ? 'admin-chats__message--user'
                        : 'admin-chats__message--support'
                    }`}
                  >
                    <div className="admin-chats__message-content">
                      {message.text}
                    </div>
                    <div className="admin-chats__message-time">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="admin-chats__input-form">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="admin-chats__input"
                />
                <button
                  type="submit"
                  className="admin-chats__send-btn"
                  disabled={!replyMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="admin-chats__no-selection">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Select a chat to view messages</h3>
              <p>Choose a chat session from the sidebar to start responding</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
