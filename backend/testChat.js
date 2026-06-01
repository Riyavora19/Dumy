const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testChat() {
  console.log('🧪 Testing Chat API...\n');

  try {
    // Test 1: Start a chat session
    console.log('1️⃣ Testing: Start Chat Session');
    const startResponse = await axios.post(`${API_URL}/chat/start`, {
      userName: 'Test User',
      userEmail: 'test@example.com'
    });
    console.log('✅ Start Chat Response:', startResponse.data);
    const sessionId = startResponse.data.data.sessionId;
    console.log('📝 Session ID:', sessionId);
    console.log('');

    // Test 2: Send a message
    console.log('2️⃣ Testing: Send Message');
    const messageResponse = await axios.post(`${API_URL}/chat/message`, {
      sessionId: sessionId,
      message: 'Hello, this is a test message!',
      userName: 'Test User',
      userEmail: 'test@example.com'
    });
    console.log('✅ Send Message Response:', messageResponse.data);
    console.log('');

    // Test 3: Get active sessions
    console.log('3️⃣ Testing: Get Active Sessions');
    const sessionsResponse = await axios.get(`${API_URL}/chat/sessions/active`);
    console.log('✅ Active Sessions Response:', sessionsResponse.data);
    console.log('📊 Number of active sessions:', sessionsResponse.data.data.length);
    console.log('');

    // Test 4: Get specific session
    console.log('4️⃣ Testing: Get Specific Session');
    const sessionResponse = await axios.get(`${API_URL}/chat/session/${sessionId}`);
    console.log('✅ Session Details:', sessionResponse.data);
    console.log('💬 Messages in session:', sessionResponse.data.data.messages.length);
    console.log('');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testChat();
