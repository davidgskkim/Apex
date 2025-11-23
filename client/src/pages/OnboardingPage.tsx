import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

interface GeneratedPlan {
  splitName: string;
  description: string;
  workouts: string[];
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [goal, setGoal] = useState('Build Muscle');
  const [experience, setExperience] = useState('Beginner');
  const [days, setDays] = useState('3');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/generate-plan', { goal, experience, days });
      setGeneratedPlan(response.data);
      setStep(2); 
    } catch (err) {
      console.error(err);
      alert('AI failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndFinish = async () => {
    setLoading(true);
    if (!generatedPlan) return;
    
    try {
      const today = new Date();
      const promises = generatedPlan.workouts.map((workoutName, index) => {
        const workoutDate = new Date();
        workoutDate.setDate(today.getDate() + index);
        workoutDate.setHours(12, 0, 0, 0);  
        const dateString = workoutDate.toISOString();

        return apiClient.post('/workouts', { 
          name: workoutName, 
          date: dateString 
        });
      });
      await Promise.all(promises);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save workouts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-lg shadow-xl max-w-lg w-full border border-slate-800">
        
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Let's Build Your Plan</h1>
            <p className="text-slate-400 mb-6">Tell us about yourself, and our AI will design your weekly schedule.</p>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Main Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Build Muscle (Hypertrophy)</option>
                  <option>Get Stronger (Strength)</option>
                  <option>Lose Weight (Endurance/Cardio)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Experience Level</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Beginner (0-1 years)</option>
                  <option>Intermediate (1-3 years)</option>
                  <option>Advanced (3+ years)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Days Per Week</label>
                <select value={days} onChange={(e) => setDays(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days</option>
                  <option value="6">6 Days</option>
                </select>
              </div>
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition mt-4 shadow-lg">
                {loading ? 'AI is working...' : 'Generate My Plan ✨'}
              </button>
            </div>
          </>
        )}

        {step === 2 && generatedPlan && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Your Custom Plan</h1>
            <h2 className="text-xl text-blue-400 font-bold mb-4">{generatedPlan.splitName}</h2>
            <p className="text-slate-400 mb-6 italic">"{generatedPlan.description}"</p>

            <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="font-bold text-blue-300 mb-2">Recommended Schedule:</h3>
              <ul className="list-disc pl-5 text-blue-100 space-y-1">
                {generatedPlan.workouts.map((name, i) => (<li key={i}>{name}</li>))}
              </ul>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 text-sm text-slate-300">
              <h4 className="font-bold text-white mb-2">🚀 Getting Started:</h4>
              <ol className="list-decimal pl-4 space-y-2">
                <li><strong>Dashboard:</strong> We will save these to your history. Click "Start Workout" on the day you go to the gym.</li>
                <li><strong>Progress:</strong> Use the Analytics page to track your strength tiers (Gold, Platinum, Diamond).</li>
                <li><strong>Coach:</strong> Use the AI Coach for form checks and advice.</li>
              </ol>
            </div>

            <button onClick={handleSaveAndFinish} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition shadow-lg">
              {loading ? 'Saving...' : 'Accept Plan & Go to Dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;