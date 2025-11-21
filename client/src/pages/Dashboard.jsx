import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  
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
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await apiClient.get('/workouts');
      setWorkouts(response.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchExercises();
    fetchWorkouts();
  }, [fetchExercises, fetchWorkouts]);

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/exercises', { name: exerciseName, category: exerciseCategory });
      setExerciseName('');
      setExerciseCategory('');
      fetchExercises(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/workouts', { name: workoutName, date: workoutDate });
      setWorkoutName('');
      setWorkoutDate('');
      fetchWorkouts(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await apiClient.delete(`/workouts/${id}`);
      fetchWorkouts();
    } catch (err) { console.error(err); }
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await apiClient.delete(`/exercises/${id}`);
      fetchExercises();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* --- HEADER --- */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Apex Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      {/* --- NAVIGATION CARDS --- */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => navigate('/progress')}
          className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition text-center font-bold"
        >
          View Progress Analytics 📈
        </button>
        <button 
          onClick={() => navigate('/coach')}
          className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition text-center font-bold"
        >
          AI Form Coach 🤖
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: FORMS --- */}
        <div className="space-y-8">
          
          {/* Create Workout Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Start New Workout</h2>
            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Workout Name (e.g., Leg Day)"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="date" 
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">
                Start Workout
              </button>
            </form>
          </div>

          {/* Create Exercise Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Add New Exercise</h2>
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Exercise Name"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="text"
                value={exerciseCategory}
                onChange={(e) => setExerciseCategory(e.target.value)}
                placeholder="Category (e.g., Chest)"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 font-bold">
                Add Exercise
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: LISTS --- */}
        <div>
          {/* Past Workouts List */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-700">History</h2>
            {workouts.length === 0 ? (
              <p className="text-gray-500">No workouts yet.</p>
            ) : (
              <ul className="space-y-3">
                {workouts.map((workout) => (
                  <li key={workout.workout_id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                    <Link 
                      to={`/workout/${workout.workout_id}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {workout.name} <span className="text-gray-500 text-sm">({new Date(workout.workout_date).toLocaleDateString()})</span>
                    </Link>
                    <button 
                      onClick={() => handleDeleteWorkout(workout.workout_id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Exercise List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Exercise Database</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {exercises.map((exercise) => (
                <li key={exercise.exercise_id} className="flex justify-between text-gray-700 border-b pb-1 last:border-0">
                  <span>{exercise.name} <span className="text-xs text-gray-400">({exercise.category})</span></span>
                  <button 
                    onClick={() => handleDeleteExercise(exercise.exercise_id)}
                    className="text-red-400 hover:text-red-600 text-xs"
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