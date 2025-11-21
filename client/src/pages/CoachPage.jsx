import React, { useState } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';

function CoachPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await apiClient.post('/coach', { message: question });
      setResponse(res.data.reply);
    } catch (err) {
      setResponse('Sorry, the coach is offline right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 mb-6 font-medium">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Form Coach 🤖</h1>
        <p className="text-gray-600 mb-8">Ask any question about form, injuries, or workout routines.</p>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How deep should I squat?"
              rows="3"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-4 resize-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold transition ${
                loading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Coach is thinking...' : 'Ask Coach'}
            </button>
          </form>
        </div>

        {/* Response Area */}
        {response && (
          <div className="bg-purple-50 border border-purple-100 p-6 rounded-lg shadow-sm animate-fade-in">
            <h3 className="text-purple-800 font-bold mb-2">Coach Says:</h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoachPage;