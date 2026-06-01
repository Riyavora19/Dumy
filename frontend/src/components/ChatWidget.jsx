import { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';
import axios from '../utils/axios';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [autoResponseTimer, setAutoResponseTimer] = useState(null);
  const messagesEndRef = useRef(null);
  const chatSessionId = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages from admin
  useEffect(() => {
    if (!isStarted || !chatSessionId.current) return;

    const pollMessages = async () => {
      try {
        const response = await axios.get(`/chat/session/${chatSessionId.current}`);
        if (response.data.success) {
          const sessionData = response.data.data;
          const serverMessages = sessionData.messages;
          
          // Check if chat was closed by admin
          if (sessionData.status === 'closed') {
            console.log('🔒 Chat session closed by admin');
            const formattedMessages = serverMessages.map((msg, index) => ({
              id: index,
              text: msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp
            }));
            
            // Add closing message if not already present
            const hasClosingMessage = formattedMessages.some(
              msg => msg.text.includes('This chat has been closed')
            );
            
            if (!hasClosingMessage) {
              formattedMessages.push({
                id: Date.now(),
                text: 'This chat has been closed by our support team. Thank you for contacting us! If you need further assistance, please start a new chat.',
                sender: 'support',
                timestamp: new Date().toISOString(),
                isClosed: true
              });
            }
            
            setMessages(formattedMessages);
            saveSession(formattedMessages);
            
            // Clear the session after showing closed message
            setTimeout(() => {
              localStorage.removeItem('chatSession');
              setIsStarted(false);
              setMessages([]);
              setUserName('');
              setUserEmail('');
              chatSessionId.current = null;
            }, 5000); // Give user 5 seconds to read the message
            
            return; // Stop polling
          }
          
          // Check if there are new messages from the server
          const currentMessageCount = messages.length;
          if (serverMessages.length > currentMessageCount) {
            console.log('📨 New messages received from server');
            const formattedMessages = serverMessages.map((msg, index) => ({
              id: index,
              text: msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp
            }));
            setMessages(formattedMessages);
            saveSession(formattedMessages);
            
            // Show unread badge if chat is closed
            if (!isOpen) {
              const newMessagesCount = serverMessages.filter(
                (msg, idx) => idx >= currentMessageCount && msg.sender === 'support'
              ).length;
              if (newMessagesCount > 0) {
                setUnreadCount(prev => prev + newMessagesCount);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Initial poll
    pollMessages();

    // Poll every 3 seconds
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [isStarted, isOpen]); // Removed 'messages' from dependencies to avoid infinite loop

  // Load chat session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('chatSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsStarted(true);
      setUserName(session.userName);
      setUserEmail(session.userEmail);
      chatSessionId.current = session.sessionId;
      
      // Load messages from server instead of localStorage
      loadMessagesFromServer(session.sessionId);
    }
  }, []);

  const loadMessagesFromServer = async (sessionId) => {
    try {
      const response = await axios.get(`/chat/session/${sessionId}`);
      if (response.data.success) {
        const serverMessages = response.data.data.messages;
        const formattedMessages = serverMessages.map((msg, index) => ({
          id: index,
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages from server:', error);
      // Fallback to localStorage
      const savedSession = localStorage.getItem('chatSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setMessages(session.messages || []);
      }
    }
  };

  // Save chat session to localStorage
  const saveSession = (newMessages) => {
    const session = {
      userName,
      userEmail,
      sessionId: chatSessionId.current,
      messages: newMessages,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('chatSession', JSON.stringify(session));
  };

  // Start chat session
  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    try {
      console.log('🚀 Starting chat session...', { userName, userEmail });
      const response = await axios.post('/chat/start', {
        userName,
        userEmail
      });

      console.log('✅ Chat session response:', response.data);

      if (response.data.success) {
        chatSessionId.current = response.data.data.sessionId;
        setIsStarted(true);
        
        const welcomeMessage = {
          id: Date.now(),
          text: `Hi ${userName}! 👋 Welcome to our support chat. How can we help you today?`,
          sender: 'support',
          timestamp: new Date().toISOString()
        };
        
        const newMessages = [welcomeMessage];
        setMessages(newMessages);
        saveSession(newMessages);
      }
    } catch (error) {
      console.error('❌ Error starting chat:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Fallback to local-only chat
      chatSessionId.current = `local-${Date.now()}`;
      setIsStarted(true);
      
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi ${userName}! 👋 Welcome to our support chat. How can we help you today?`,
        sender: 'support',
        timestamp: new Date().toISOString()
      };
      
      const newMessages = [welcomeMessage];
      setMessages(newMessages);
      saveSession(newMessages);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageText = inputMessage;
    setInputMessage('');
    saveSession(newMessages);

    // Send to backend
    try {
      console.log('📤 Sending message to backend...', {
        sessionId: chatSessionId.current,
        message: messageText,
        userName,
        userEmail
      });

      await axios.post('/chat/message', {
        sessionId: chatSessionId.current,
        message: messageText,
        userName,
        userEmail
      });

      console.log('✅ Message sent successfully');
      
      // Smart auto-response system
      scheduleAutoResponse(messageText, newMessages);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Smart auto-response scheduling
  const scheduleAutoResponse = async (messageText, currentMessages) => {
    try {
      // Clear any existing timer
      if (autoResponseTimer) {
        clearTimeout(autoResponseTimer);
      }

      // Get chat settings
      const settingsResponse = await axios.get('/chat-settings');
      const settings = settingsResponse.data.data;

      // Check if auto-response is enabled
      if (!settings.autoResponseEnabled) {
        console.log('⚙️ Auto-response disabled in settings');
        return;
      }

      // Check business hours
      const businessHoursResponse = await axios.get('/chat-settings/is-business-hours');
      const isBusinessHours = businessHoursResponse.data.data.isBusinessHours;

      if (settings.businessHoursEnabled && !isBusinessHours) {
        // Outside business hours - send offline message immediately
        console.log('🌙 Outside business hours - sending offline message');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          sendAutoResponse(settings.offlineMessage);
        }, 1500);
        return;
      }

      // Within business hours - schedule delayed auto-response
      const delay = settings.autoResponseDelay * 1000; // Convert to milliseconds
      console.log(`⏰ Scheduling auto-response in ${settings.autoResponseDelay} seconds`);

      const timer = setTimeout(async () => {
        // Check if admin has replied in the meantime
        try {
          const sessionResponse = await axios.get(`/chat/session/${chatSessionId.current}`);
          const serverMessages = sessionResponse.data.data.messages;
          
          // Check if there are any new support messages since we sent our message
          const supportReplies = serverMessages.filter(
            msg => msg.sender === 'support' && 
            new Date(msg.timestamp) > new Date(currentMessages[currentMessages.length - 1].timestamp)
          );

          if (supportReplies.length > 0) {
            console.log('✅ Admin replied - canceling auto-response');
            return;
          }

          // No admin reply - send auto-response
          console.log('🤖 Sending auto-response (admin did not reply in time)');
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const autoResponse = getAutoResponse(messageText);
            if (autoResponse) {
              sendAutoResponse(autoResponse);
            }
          }, 1500);
        } catch (error) {
          console.error('Error checking for admin replies:', error);
        }
      }, delay);

      setAutoResponseTimer(timer);
    } catch (error) {
      console.error('Error in auto-response scheduling:', error);
    }
  };

  // Send auto-response to backend
  const sendAutoResponse = async (message) => {
    try {
      await axios.post('/chat/reply', {
        sessionId: chatSessionId.current,
        message: message,
        isAutoResponse: true
      });
      console.log('✅ Auto-response sent');
    } catch (error) {
      console.error('Error sending auto-response:', error);
    }
  };

  // Auto-response logic
  const getAutoResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our products have competitive pricing. You can view prices on each product page. For bulk orders or special discounts, please contact our sales team.';
    }
    
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return 'We offer fast delivery across the country. Delivery time typically ranges from 3-7 business days depending on your location. Free shipping on orders above ₹10,000!';
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'We have a 30-day return policy. If you\'re not satisfied with your purchase, you can return it within 30 days for a full refund. Product must be unused and in original packaging.';
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery. All transactions are 100% secure.';
    }
    
    if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
      return 'All our products come with manufacturer warranty. Warranty period varies by product and brand. Check individual product pages for specific warranty details.';
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return 'You can reach us at:\n📧 Email: support@gtss.com\n📞 Phone: +91-XXXXXXXXXX\n🕐 Hours: Mon-Sat, 9 AM - 6 PM';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! How can I assist you today? Feel free to ask about products, pricing, delivery, or anything else!';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with? 😊';
    }
    
    // Default response
    return 'Thank you for your message! A support representative will get back to you shortly. In the meantime, you can browse our products or check our FAQ section.';
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Reset chat
  const handleResetChat = () => {
    if (window.confirm('Are you sure you want to end this chat session?')) {
      localStorage.removeItem('chatSession');
      setIsStarted(false);
      setMessages([]);
      setUserName('');
      setUserEmail('');
      chatSessionId.current = null;
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-widget__button ${isOpen ? 'chat-widget__button--open' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {unreadCount > 0 && (
              <span className="chat-widget__badge">{unreadCount}</span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget__window">
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-info">
              <div className="chat-widget__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h3>Customer Support</h3>
                <span className="chat-widget__status">
                  <span className="chat-widget__status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              className="chat-widget__close"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          {!isStarted ? (
            // Start Chat Form
            <div className="chat-widget__start">
              <div className="chat-widget__start-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h4>Start a Conversation</h4>
              <p>We typically reply within minutes</p>
              
              <form onSubmit={handleStartChat}>
                <div className="chat-widget__form-group">
                  <label htmlFor="chat-name">Your Name</label>
                  <input
                    id="chat-name"
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="chat-widget__form-group">
                  <label htmlFor="chat-email">Email Address</label>
                  <input
                    id="chat-email"
                    type="email"
                    placeholder="Enter your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="chat-widget__start-btn">
                  Start Chat
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="chat-widget__messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-widget__message ${
                      message.isClosed 
                        ? 'chat-widget__message--closed'
                        : message.sender === 'user' 
                        ? 'chat-widget__message--user' 
                        : 'chat-widget__message--support'
                    }`}
                  >
                    <div className="chat-widget__message-content">
                      {message.isClosed && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '8px' }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      )}
                      {message.text}
                    </div>
                    <div className="chat-widget__message-time">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="chat-widget__message chat-widget__message--support">
                    <div className="chat-widget__message-content">
                      <div className="chat-widget__typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-widget__input-container">
                <button
                  className="chat-widget__reset"
                  onClick={handleResetChat}
                  title="End chat session"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                </button>
                <form onSubmit={handleSendMessage} className="chat-widget__input-form">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="chat-widget__input"
                  />
                  <button 
                    type="submit" 
                    className="chat-widget__send"
                    disabled={!inputMessage.trim()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
