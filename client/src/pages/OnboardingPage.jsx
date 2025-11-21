import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [goal, setGoal] = useState('Build Muscle');
  const [experience, setExperience] = useState('Beginner');
  const [days, setDays] = useState('3');

  // AI Result State
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/generate-plan', { goal, experience, days });
      setGeneratedPlan(response.data);
      setStep(2); // Move to results step
    } catch (err) {
      console.error(err);
      alert('AI failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndFinish = async () => {
    setLoading(true);
    try {
      // 1. Create each workout in the database
      // We map over the suggested workouts and send a POST request for each
      const promises = generatedPlan.workouts.map(workoutName => 
        apiClient.post('/workouts', { name: workoutName })
      );
      
      await Promise.all(promises);

      // 2. Redirect to Dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save workouts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        
        {/* STEP 1: THE QUIZ */}
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Let's Build Your Plan</h1>
            <p className="text-gray-600 mb-6">Tell us about yourself, and our AI will design your weekly schedule.</p>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Main Goal</label>
                <select 
                  value={goal} onChange={(e) => setGoal(e.target.value)}
                  className="w-full border p-3 rounded-lg bg-white"
                >
                  <option>Build Muscle (Hypertrophy)</option>
                  <option>Get Stronger (Strength)</option>
                  <option>Lose Weight (Endurance/Cardio)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Experience Level</label>
                <select 
                  value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full border p-3 rounded-lg bg-white"
                >
                  <option>Beginner (0-1 years)</option>
                  <option>Intermediate (1-3 years)</option>
                  <option>Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Days Per Week</label>
                <select 
                  value={days} onChange={(e) => setDays(e.target.value)}
                  className="w-full border p-3 rounded-lg bg-white"
                >
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days</option>
                  <option value="6">6 Days</option>
                </select>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4"
              >
                {loading ? 'AI is working...' : 'Generate My Plan ✨'}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: THE RESULTS & FAQ */}
        {step === 2 && generatedPlan && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Custom Plan</h1>
            <h2 className="text-xl text-blue-600 font-bold mb-4">{generatedPlan.splitName}</h2>
            <p className="text-gray-600 mb-6 italic">"{generatedPlan.description}"</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="font-bold text-blue-800 mb-2">Recommended Schedule:</h3>
              <ul className="list-disc pl-5 text-blue-900 space-y-1">
                {generatedPlan.workouts.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>

            {/* THIS IS THE NATURAL FAQ SECTION */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-sm">
              <h4 className="font-bold text-gray-700 mb-2">🚀 How to use Apex:</h4>
              <ol className="list-decimal pl-4 space-y-2 text-gray-600">
                <li>We will save these workouts to your <strong>Dashboard</strong>.</li>
                <li>When you go to the gym, click <strong>"Start Workout"</strong> on the specific day.</li>
                <li>Add exercises and log your sets as you go!</li>
              </ol>
            </div>

            <button 
              onClick={handleSaveAndFinish} 
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              {loading ? 'Saving...' : 'Accept Plan & Go to Dashboard →'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default OnboardingPage;