import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { EXERCISE_LIST } from '../data/strengthStandards';
import { Exercise, Workout } from '../types';

function Dashboard() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const fetchExercises = useCallback(async () => {
    try {
      const response = await apiClient.get('/exercises');
      setExercises(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await apiClient.get('/workouts');
      setWorkouts(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchExercises();
    fetchWorkouts();
  }, [fetchExercises, fetchWorkouts]);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/exercises', { name: exerciseName, category: exerciseCategory });
      setExerciseName('');
      setExerciseCategory('');
      fetchExercises(); 
    } catch (err) { console.error(err); }
  };

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/workouts', { name: workoutName, date: workoutDate });
      setWorkoutName('');
      setWorkoutDate('');
      fetchWorkouts(); 
    } catch (err) { console.error(err); }
  };

  const handleDeleteWorkout = async (id: number) => {
    if (!window.confirm('Delete this workout?')) return;
    try { await apiClient.delete(`/workouts/${id}`); fetchWorkouts(); } catch (err) { console.error(err); }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!window.confirm('Delete this exercise?')) return;
    try { await apiClient.delete(`/exercises/${id}`); fetchExercises(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      
      {/* NAVIGATION CARDS */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-4">
        <button 
          onClick={() => navigate('/progress')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-xl shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 transition transform hover:-translate-y-1 text-center font-bold text-lg border border-violet-500/30"
        >
          View Progress Analytics 📈
        </button>
        <button 
          onClick={() => navigate('/coach')}
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white p-6 rounded-xl shadow-lg shadow-fuchsia-900/20 hover:shadow-fuchsia-900/40 transition transform hover:-translate-y-1 text-center font-bold text-lg border border-fuchsia-500/30"
        >
          AI Form Coach 🤖
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          
          {/* Create Workout */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-green-400">●</span> Start New Workout
            </h2>
            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Workout Name (e.g., Leg Day)"
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                required
              />
              <input
                type="date" 
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 font-bold shadow-lg shadow-green-900/20 transition">
                Start Workout
              </button>
            </form>
          </div>

          {/* Create Exercise */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-blue-400">●</span> Add New Exercise
            </h2>
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Category</label>
                <select
                  value={exerciseCategory}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setExerciseCategory(newCategory);
                    setExerciseName(EXERCISE_LIST[newCategory][0]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="" disabled>Select Category</option>
                  {Object.keys(EXERCISE_LIST).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Exercise</label>
                <select
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={!exerciseCategory}
                >
                  {!exerciseCategory ? <option>Select a category first</option> : 
                    EXERCISE_LIST[exerciseCategory].map(ex => <option key={ex} value={ex}>{ex}</option>)
                  }
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 font-bold border border-slate-600 transition">
                Add to Database
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Past Workouts */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-white">Recent History</h2>
            {workouts.length === 0 ? (
              <p className="text-slate-500 italic">No workouts yet.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {workouts.map((workout) => (
                  <li key={workout.workout_id} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition group">
                    <Link 
                      to={`/workout/${workout.workout_id}`}
                      className="text-violet-400 font-semibold hover:text-violet-300 transition flex-1"
                    >
                      {workout.name} 
                      <span className="block text-slate-500 text-xs font-normal mt-1">
                        {new Date(workout.workout_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </Link>
                    <button 
                      onClick={() => handleDeleteWorkout(workout.workout_id)}
                      className="text-slate-600 hover:text-red-500 transition p-2"
                      title="Delete Workout"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Exercise List */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-white">My Exercises</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {exercises.map((exercise) => (
                <li key={exercise.exercise_id} className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2 last:border-0">
                  <span>
                    {exercise.name} 
                    <span className="text-xs text-slate-500 ml-2 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {exercise.category}
                    </span>
                  </span>
                  <button 
                    onClick={() => handleDeleteExercise(exercise.exercise_id)}
                    className="text-xs text-slate-600 hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;