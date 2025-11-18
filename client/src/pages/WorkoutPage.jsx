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
      console.log('Workout Logs:', response.data);
    } catch (err) {
      console.error('Failed to fetch workout logs:', err);
      if (err.response && err.response.status === 401) handleLogout();
    }
  }, [workoutId, handleLogout]);

  useEffect(() => {
    const fetchAllExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        setExercises(response.data);
        console.log('All Exercises:', response.data);
        if (response.data.length > 0) {
          setSelectedExercise(response.data[0].exercise_id);
        }
      } catch (err) {
        console.error('Failed to fetch exercises:', err);
        if (err.response && err.response.status === 401) handleLogout();
      }
    };

    fetchAllExercises();
    fetchLogs(); 
  }, [workoutId, handleLogout, fetchLogs]); 

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/logs', {
        workout_id: workoutId,
        exercise_id: selectedExercise,
        sets: parseInt(sets), 
        reps: parseInt(reps),
        weight_kg: parseFloat(weight),
        notes: notes,
      });

      console.log('Log created:', response.data);

      fetchLogs();

      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
    } catch (err) {
      console.error('Failed to add log:', err);
    }
  };

  return (
    <div>
      <h1>Workout Details</h1>

      <form onSubmit={handleAddLog}>
        <h3>Add New Log</h3>
        <div>
          <label>Exercise:</label>
          <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map((exercise) => (
              <option key={exercise.exercise_id} value={exercise.exercise_id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Sets:</label>
          <input 
            type="number" 
            value={sets} 
            onChange={(e) => setSets(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Reps:</label>
          <input 
            type="number" 
            value={reps} 
            onChange={(e) => setReps(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Weight (kg):</label>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Notes:</label>
          <input 
            type="text" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </div>
        <button type="submit">Add Log</button>
      </form>

      <hr />

      <h2>Logs for this session:</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.log_id}>
            {log.exercise_name}: {log.sets} sets x {log.reps} reps @ {log.weight_kg}kg
            {log.notes && ` - Notes: ${log.notes}`} {/* Only show notes if they exist */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkoutPage;