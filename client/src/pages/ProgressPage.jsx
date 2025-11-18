import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import apiClient from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ProgressPage() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState(null);

  // 1. Helper Function: Calculate Epley 1RM
  const calculateE1RM = (weight, reps) => {
    return weight * (1 + reps / 30);
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        setExercises(response.data);
        if (response.data.length > 0) setSelectedExercise(response.data[0].exercise_id);
      } catch (err) {
        console.error('Failed to fetch exercises', err);
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    if (!selectedExercise) return;

    const fetchProgress = async () => {
      try {
        const response = await apiClient.get(`/progress/${selectedExercise}`);
        const rawHistory = response.data;

        if (rawHistory.length === 0) {
          setChartData(null);
          return;
        }

        // --- DATA PROCESSING ---

        // 2. Group data by Date to find the "Best Set" of each day
        const bestSetsByDate = {};

        rawHistory.forEach(log => {
          // Convert date to standard string (YYYY-MM-DD)
          const dateStr = new Date(log.workout_date).toLocaleDateString();
          const e1rm = calculateE1RM(parseFloat(log.weight_kg), log.reps);

          // If this is the first log for this date, OR if this log is better than the stored one
          if (!bestSetsByDate[dateStr] || e1rm > bestSetsByDate[dateStr].e1rm) {
            bestSetsByDate[dateStr] = {
              date: dateStr,
              e1rm: e1rm,
              actualWeight: log.weight_kg,
              reps: log.reps
            };
          }
        });

        // Convert the object back to an array and sort by date
        const processedHistory = Object.values(bestSetsByDate).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );

        // 3. Prepare Chart Data
        const labels = processedHistory.map(item => item.date);
        const dataPoints = processedHistory.map(item => item.e1rm);

        // Ideal Trend Calculation (Based on the FIRST day's E1RM)
        const startScore = dataPoints[0];
        const startDate = new Date(processedHistory[0].date);

        const idealData = processedHistory.map(item => {
          const currentDate = new Date(item.date);
          const diffTime = Math.abs(currentDate - startDate);
          const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); 
          // 2.5% increase on the SCORE per week
          return startScore * (1 + 0.025 * diffWeeks);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'Strength Score (Est. 1RM)',
              data: dataPoints,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1,
            },
            {
              label: 'Ideal Trend (+2.5%)',
              data: idealData,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderDash: [5, 5],
              tension: 0.1,
            },
          ],
        });

      } catch (err) {
        console.error('Failed to fetch progress', err);
      }
    };

    fetchProgress();
  }, [selectedExercise]);

  return (
    <div>
      <h1>Progress Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>Select Exercise: </label>
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
          {exercises.map(ex => (
            <option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        {chartData ? (
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: { display: true, text: 'Calculated Strength Score (Weight × Reps)' },
                tooltip: {
                  callbacks: {
                    // Custom tooltip to show the ACTUAL weight/reps
                    afterLabel: function(context) {
                       // We can't easily access original weight/reps here without
                       // passing it into the dataset, but for now, the score is fine.
                       return "Higher is better!";
                    }
                  }
                }
              }
            }} 
          />
        ) : <p>No data found.</p>}
      </div>
    </div>
  );
}

export default ProgressPage;