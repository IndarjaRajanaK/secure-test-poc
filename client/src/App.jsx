// client/src/App.jsx
import { useEffect, useState } from 'react';
import ExamPage from './pages/ExamPage';

export default function App() {
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState('user123'); // for PoC, hardcoded

  useEffect(() => {
    // Simulate OTP verify & token fetch
    const login = async () => {
      const res = await fetch('https://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setToken(data.token);
      setSessionId(data.sessionId);
    };
    login();
  }, []);

  if (!token || !sessionId) return <p>Loading authentication...</p>;

  return <ExamPage token={token} userId={userId} sessionId={sessionId} />;
}
