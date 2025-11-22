import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

function WorkoutPage() {
  const [logs, setLogs] = useState([]);
  const [exercises, setExercises] = useState([]); 
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const { id: workoutId } = useParams(); 
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await apiClient.get(`/workouts/${workoutId}`);
      setLogs(response.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [workoutId, handleLogout]);

  useEffect(() => {
    const fetchAllExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        setExercises(response.data);
        if (response.data.length > 0) {
          setSelectedExercise(response.data[0].exercise_id);
        }
      } catch (err) {
        if (err.response?.status === 401) handleLogout();
      }
    };
    fetchAllExercises();
    fetchLogs(); 
  }, [workoutId, handleLogout, fetchLogs]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/logs', {
        workout_id: workoutId,
        exercise_id: selectedExercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight_kg: parseFloat(weight),
        notes: notes,
      });
      fetchLogs();
      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure?')) return;
    try { await apiClient.delete(`/logs/${logId}`); fetchLogs(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white font-medium flex items-center transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Workout Details</h1>

        {/* Add Log Card */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800 mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">Add New Log</h3>
          <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Exercise</label>
              <select 
                value={selectedExercise} 
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {exercises.map((exercise) => (
                  <option key={exercise.exercise_id} value={exercise.exercise_id}>{exercise.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Sets</label>
              <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} required 
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} required 
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required 
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 font-bold transition">
                Add Log
              </button>
            </div>
          </form>
        </div>

        {/* Logs List */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
          <h3 className="text-xl font-bold mb-4 text-white">Session Logs</h3>
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">No logs yet.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {logs.map((log) => (
                <li key={log.log_id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{log.exercise_name}</span>
                    <div className="text-sm text-slate-400">
                      {log.sets} sets × {log.reps} reps @ {log.weight_kg}kg
                      {log.notes && <span className="italic ml-2 text-slate-500">- {log.notes}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteLog(log.log_id)}
                    className="text-slate-600 hover:text-red-500 text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutPage;