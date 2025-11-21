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
  
  // Default to 7 days as requested
  const [timeRange, setTimeRange] = useState(7); 

  const calculateE1RM = (weight, reps) => weight * (1 + reps / 30);

  // 1. Helper to generate every single date in the range
  const generateDateLabels = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

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

        // Create the continuous timeline
        const labels = generateDateLabels(timeRange);
        const dataPoints = new Array(timeRange).fill(null); // Start with all nulls (gaps)

        // Map actual logs to the timeline
        const today = new Date();
        // Normalize today to midnight for accurate comparison
        today.setHours(0, 0, 0, 0);

        rawHistory.forEach(log => {
          const logDate = new Date(log.workout_date);
          logDate.setHours(0, 0, 0, 0);

          // Calculate how many days ago this log was
          const diffTime = today - logDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          // If this log falls within our selected range
          if (diffDays < timeRange && diffDays >= 0) {
            // The index in our array is (Length - 1) - DaysAgo
            const index = (timeRange - 1) - diffDays;
            
            const e1rm = calculateE1RM(parseFloat(log.weight_kg), log.reps);
            
            // If we already have a log for this day, keep the best one
            if (dataPoints[index] === null || e1rm > dataPoints[index]) {
              dataPoints[index] = e1rm;
            }
          }
        });

        // Ideal Trend Calculation (2.5% per week = ~0.35% per day)
        // Find first actual data point to start the trend
        const firstValidIndex = dataPoints.findIndex(val => val !== null);
        let idealData = [];
        
        if (firstValidIndex !== -1) {
          const startScore = dataPoints[firstValidIndex];
          idealData = labels.map((_, i) => {
            if (i < firstValidIndex) return null;
            const daysPassed = i - firstValidIndex;
            // 0.0035 is approx 2.5% divided by 7 days
            return startScore * (1 + 0.0035 * daysPassed);
          });
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Strength Score',
              data: dataPoints,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1,
              spanGaps: true, // <--- THIS IS MAGIC: Connects dots over empty days
              pointRadius: 5,
              pointHoverRadius: 8
            },
            {
              label: 'Ideal Trend',
              data: idealData,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderDash: [5, 5],
              pointRadius: 0,
              spanGaps: true
            },
          ],
        });

      } catch (err) { console.error(err); }
    };
    fetchProgress();
  }, [selectedExercise, timeRange]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 mb-6 font-medium">
          ← Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Progress Analytics</h1>
            
            <div className="flex gap-4">
               {/* Time Range Selector */}
               <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
              </select>

              {/* Exercise Selector */}
              <select 
                value={selectedExercise} 
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
              >
                {exercises.map(ex => (
                  <option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-96 w-full">
            {chartData ? (
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { title: { display: true, text: 'Strength Score' } }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                           return context.parsed.y ? `Score: ${context.parsed.y.toFixed(1)}` : '';
                        }
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;