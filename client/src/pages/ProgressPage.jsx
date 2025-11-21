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
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ProgressPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState(null);

  const calculateE1RM = (weight, reps) => weight * (1 + reps / 30);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        setExercises(response.data);
        if (response.data.length > 0) setSelectedExercise(response.data[0].exercise_id);
      } catch (err) { console.error(err); }
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

        const bestSetsByDate = {};
        rawHistory.forEach(log => {
          const dateStr = new Date(log.workout_date).toLocaleDateString();
          const e1rm = calculateE1RM(parseFloat(log.weight_kg), log.reps);
          if (!bestSetsByDate[dateStr] || e1rm > bestSetsByDate[dateStr].e1rm) {
            bestSetsByDate[dateStr] = { date: dateStr, e1rm: e1rm };
          }
        });

        const processedHistory = Object.values(bestSetsByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = processedHistory.map(item => item.date);
        const dataPoints = processedHistory.map(item => item.e1rm);

        const startScore = dataPoints[0];
        const startDate = new Date(processedHistory[0].date);
        const idealData = processedHistory.map(item => {
          const currentDate = new Date(item.date);
          const diffTime = Math.abs(currentDate - startDate);
          const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); 
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
      } catch (err) { console.error(err); }
    };
    fetchProgress();
  }, [selectedExercise]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 mb-6 font-medium">
          ← Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Progress Analytics</h1>
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {exercises.map(ex => (
                <option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="h-96 w-full">
            {chartData ? (
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: { display: true, text: 'Calculated Strength Score (Weight × Reps)' }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data found for this exercise. Go log some workouts!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;