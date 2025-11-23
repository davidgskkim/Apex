import { useState } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';

function CoachPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-6 font-medium transition">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">AI Form Coach 🤖</h1>
        <p className="text-slate-400 mb-8">Ask any question about form, injuries, or workout routines.</p>

        <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How deep should I squat?"
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none mb-4 resize-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold transition ${
                loading ? 'bg-purple-800' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              {loading ? 'Coach is thinking...' : 'Ask Coach'}
            </button>
          </form>
        </div>

        {response && (
          <div className="bg-slate-800 border border-purple-500/30 p-6 rounded-lg shadow-lg animate-fade-in">
            <h3 className="text-purple-400 font-bold mb-2">Coach Says:</h3>
            <p className="text-slate-200 leading-relaxed whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoachPage;