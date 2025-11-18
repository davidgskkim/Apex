import React, { useState } from 'react';
import apiClient from '../api';

function CoachPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false); // To handle the waiting time

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true); // Start loading
    setResponse('');  // Clear previous answer

    try {
      const res = await apiClient.post('/coach', { message: question });
      setResponse(res.data.reply);
    } catch (err) {
      console.error('AI Error:', err);
      setResponse('Sorry, the coach is busy right now. Try again later.');
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <div>
      <h1>AI Form Coach 🤖</h1>
      <p>Ask any question about exercise form, injury prevention, or workout tips.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., My lower back hurts when I deadlift. What am I doing wrong?"
          rows="4"
          cols="50"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask Coach'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Coach Says:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default CoachPage;