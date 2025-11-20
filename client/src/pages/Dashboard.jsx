import Reac, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api'

function Dashboard() {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([])
  const [exerciseName, setExerciseName] = useState('')
  const [exerciseCategory, setExerciseCategory] = useState('')
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState('')

  const handleLogout = useCallback (() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate])

  const fetchExercises = useCallback(async () => {
    try {
      const exercisesResponse = await apiClient.get('/exercises');
      setExercises(exercisesResponse.data);
      console.log('Exercises:', exercisesResponse.data);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
      if (err.response && err.response.status === 401) handleLogout();
    }
  }, [handleLogout]); // Add handleLogout as a dependency

  const fetchWorkouts = useCallback(async () => {
    try {
      const workoutsResponse = await apiClient.get('/workouts');
      setWorkouts(workoutsResponse.data);
      console.log('Workouts:', workoutsResponse.data);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
      if (err.response && err.response.status === 401) handleLogout();
    }
  }, [handleLogout])

  useEffect(() => {
    fetchExercises();
    fetchWorkouts();
  }, [fetchExercises, fetchWorkouts])

  const handleCreateExercise = async (e) => {
    e.preventDefault(); // Stop the form from refreshing
    try {
      // Call our API to create the new exercise
      const response = await apiClient.post('/exercises', {
        name: exerciseName,
        category: exerciseCategory,
      });
      
      console.log('Created exercise:', response.data)
      
      // Clear the form fields
      setExerciseName('');
      setExerciseCategory('');
      
      // RE-FETCH the exercise list to update our UI
      fetchExercises(); 
      
    } catch (err) {
      console.error('Failed to create exercise:', err)
    }
  }

  const handleCreateWorkout = async (e) => {
    e.preventDefault(); 
    try {
      const response = await apiClient.post('/workouts', {
        name: workoutName,
        date: workoutDate,
      })
      console.log('Created workout:', response.data)
      setWorkoutName('')
      setWorkoutDate('')
      fetchWorkouts()
    } catch (err) {
      console.error('Failed to create workout:', err)
    }
  }

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await apiClient.delete(`/workouts/${id}`);
      fetchWorkouts(); // Refresh list
    } catch (err) {
      console.error('Failed to delete workout', err);
    }
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await apiClient.delete(`/exercises/${id}`);
      fetchExercises(); // Refresh list
    } catch (err) {
      console.error('Failed to delete exercise', err);
    }
  }

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/progress')}>
          View Progress Analytics 📈
        </button>
        <button onClick={() => navigate('/coach')} style={{ marginLeft: '10px' }}>
          AI Form Coach 🤖
        </button>
      </div>
      <button onClick={handleLogout}>Log Out</button>

      <hr />

      <div>
        <h2>Start a New Workout</h2>
        <form onSubmit={handleCreateWorkout}>
          <div>
            <label>Workout Name:</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Leg Day"
              required
            />
          </div>
          <div>
            <label>Date (Optional):</label>
            <input
              type="date" 
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
            />
          </div>
          <button type="submit">Start Workout</button>
        </form>
      </div>

      <hr />

      <div>
        <h2>My Past Workouts</h2>
        <ul>
          {workouts.map((workout) => (
            <li key={workout.workout_id}>
              <Link to={`/workout/${workout.workout_id}`}>
                {workout.name} - {new Date(workout.workout_date).toLocaleDateString()}
              </Link>  
              <button 
                onClick={() => handleDeleteWorkout(workout.workout_id)}
                style={{ marginLeft: '10px', color: 'red' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <hr />

      <div>
        <h2>Create a New Exercise</h2>
        <form onSubmit={handleCreateExercise}>
          <div>
            <label>Exercise Name:</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Category:</label>
            <input
              type="text"
              value={exerciseCategory}
              onChange={(e) => setExerciseCategory(e.target.value)}
              required
          />
          </div>
          <button type="submit">Create Exercise</button>
        </form>
      </div>

      <hr />

      <div>
        <h2>My Exercises</h2>
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.exercise_id}>
              {exercise.name} ({exercise.category})
              <button 
                onClick={() => handleDeleteExercise(exercise.exercise_id)}
                style={{ marginLeft: '10px', color: 'red' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard;