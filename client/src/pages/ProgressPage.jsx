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
// Import the new descriptions
import { STRENGTH_STANDARDS, RANK_DESCRIPTIONS, getRank } from '../data/strengthStandards';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ProgressPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState(7);
  
  // State for Rank & Modal
  const [rank, setRank] = useState(null);
  const [showRankModal, setShowRankModal] = useState(false); // <--- Modal State
  const [isLoading, setIsLoading] = useState(false);

  const calculateE1RM = (weight, reps) => weight * (1 + reps / 30);

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

  // Helper to get color based on rank
  const getRankColor = (r) => {
    switch(r) {
      case 'Apex': return 'text-purple-600';
      case 'Diamond': return 'text-blue-500';
      case 'Platinum': return 'text-cyan-500';
      case 'Gold': return 'text-yellow-500';
      case 'Silver': return 'text-gray-400';
      case 'Bronze': return 'text-orange-700';
      default: return 'text-gray-500';
    }
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
      setIsLoading(true); // <--- START LOADING
      setChartData(null); // Reset chart while loading
      try {
        const response = await apiClient.get(`/progress/${selectedExercise}`);
        const rawHistory = response.data;

        if (rawHistory.length === 0) {
          setChartData(null);
          setRank(null);
          setIsLoading(false);
          return;
        }

        // Rank Logic
        const maxWeightEver = Math.max(...rawHistory.map(log => parseFloat(log.weight_kg)));
        const currentExerciseName = exercises.find(e => e.exercise_id == selectedExercise)?.name;
        const currentRank = getRank(currentExerciseName, maxWeightEver);
        setRank(currentRank);

        // Chart Logic
        const labels = generateDateLabels(timeRange);
        const dataPoints = new Array(timeRange).fill(null);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        rawHistory.forEach(log => {
          const logDate = new Date(log.workout_date);
          logDate.setHours(0, 0, 0, 0);
          const diffTime = today - logDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < timeRange && diffDays >= 0) {
            const index = (timeRange - 1) - diffDays;
            const e1rm = calculateE1RM(parseFloat(log.weight_kg), log.reps);
            if (dataPoints[index] === null || e1rm > dataPoints[index]) {
              dataPoints[index] = e1rm;
            }
          }
        });

        // Ideal Trend Logic
        const firstValidIndex = dataPoints.findIndex(val => val !== null);
        let idealData = [];
        if (firstValidIndex !== -1) {
          const startScore = dataPoints[firstValidIndex];
          idealData = labels.map((_, i) => {
            if (i < firstValidIndex) return null;
            const daysPassed = i - firstValidIndex;
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
              spanGaps: true,
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

      } catch (err) { 
        console.error(err); 
      } finally {
        setIsLoading(false); // <--- STOP LOADING (Done)
      }
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Progress Analytics</h1>
              <div className="flex items-center gap-3 mt-1">
                {rank && (
                  <span className="text-sm font-medium text-gray-500">
                    Current Rank: <span className={`font-bold text-lg ${getRankColor(rank)}`}>{rank}</span>
                  </span>
                )}
                {/* --- THE NEW BUTTON --- */}
                <button 
                  onClick={() => setShowRankModal(true)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border"
                >
                  ℹ️ View Distribution
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
               <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))} className="border p-2 rounded bg-white text-sm">
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
               </select>
               <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="border p-2 rounded bg-white font-bold">
                {exercises.map(ex => (<option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>))}
               </select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-96 w-full mb-8 flex items-center justify-center">
            {isLoading ? (
              // State 1: Loading
              <div className="text-gray-500 animate-pulse">Loading chart data...</div>
            ) : chartData ? (
              // State 2: Chart exists
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { title: { display: true, text: 'Strength Score' } } },
                  plugins: {
                    tooltip: { callbacks: { label: (c) => c.parsed.y ? `Score: ${c.parsed.y.toFixed(1)}` : '' } }
                  }
                }} 
              />
            ) : (
              // State 3: No Data (The fix you wanted)
              <div className="text-center">
                <p className="text-gray-500 mb-2">No logs found for this exercise yet.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Go log a workout to see your progress! →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RANK DISTRIBUTION MODAL --- */}
      {showRankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowRankModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rank Distribution</h2>
            <p className="text-sm text-gray-500 mb-4">
              Standards for <strong>{exercises.find(e => e.exercise_id == selectedExercise)?.name}</strong> (1 Rep Max)
            </p>

            {/* Render the Table for this Exercise */}
            {STRENGTH_STANDARDS[exercises.find(e => e.exercise_id == selectedExercise)?.name] ? (
              <div className="space-y-3">
                {Object.entries(STRENGTH_STANDARDS[exercises.find(e => e.exercise_id == selectedExercise).name])
                  .reverse() // Show Apex at top
                  .map(([rankName, weight]) => (
                  <div key={rankName} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div className="flex flex-col">
                      <span className={`font-bold ${getRankColor(rankName)}`}>{rankName}</span>
                      <span className="text-xs text-gray-400">{RANK_DESCRIPTIONS[rankName]}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-700">{weight} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No official ranked standards for this exercise yet.</p>
            )}
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowRankModal(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 font-medium w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProgressPage;