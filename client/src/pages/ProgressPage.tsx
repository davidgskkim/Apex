import { useState, useEffect } from 'react';
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
  Filler 
} from 'chart.js';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import { STRENGTH_STANDARDS, RANK_DESCRIPTIONS, getRank } from '../data/strengthStandards';
import { Exercise } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function ProgressPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState(7);
  const [rank, setRank] = useState<string | null>(null);
  const [showRankModal, setShowRankModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Epley formula for estimated 1RM
  const calculateE1RM = (weight: number, reps: number) => weight * (1 + reps / 30);

  const generateDateLabels = (days: number) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  const getRankColor = (r: string) => {
    switch(r) {
      case 'Apex': return 'text-purple-400';
      case 'Diamond': return 'text-cyan-400';
      case 'Platinum': return 'text-emerald-400';
      case 'Gold': return 'text-yellow-400';
      case 'Silver': return 'text-gray-300';
      case 'Bronze': return 'text-orange-400';
      default: return 'text-gray-500';
    }
  };

  const getBorderColor = (r: string) => {
    switch(r) {
      case 'Apex': return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
      case 'Diamond': return 'border-cyan-500';
      case 'Platinum': return 'border-emerald-500';
      case 'Gold': return 'border-yellow-500';
      case 'Silver': return 'border-slate-400';
      case 'Bronze': return 'border-orange-600';
      default: return 'border-gray-700';
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        setExercises(response.data);
        if (response.data.length > 0) setSelectedExercise(String(response.data[0].exercise_id));
      } catch (err) { console.error(err); }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    if (!selectedExercise) return;
    const fetchProgress = async () => {
      setIsLoading(true);
      setChartData(null);
      try {
        const response = await apiClient.get(`/progress/${selectedExercise}`);
        const rawHistory: any[] = response.data;

        if (rawHistory.length === 0) {
          setChartData(null);
          setRank(null);
          setIsLoading(false);
          return;
        }

        const maxWeightEver = Math.max(...rawHistory.map(log => parseFloat(log.weight_kg)));
        const currentExerciseName = exercises.find(e => String(e.exercise_id) === selectedExercise)?.name;
        if (currentExerciseName) {
            const currentRank = getRank(currentExerciseName, maxWeightEver);
            setRank(currentRank);
        }

        const labels = generateDateLabels(timeRange);
        const dataPoints = new Array(timeRange).fill(null);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        rawHistory.forEach(log => {
          const logDate = new Date(log.workout_date);
          logDate.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - logDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < timeRange && diffDays >= 0) {
            const index = (timeRange - 1) - diffDays;
            const e1rm = calculateE1RM(parseFloat(log.weight_kg), log.reps);
            if (dataPoints[index] === null || e1rm > dataPoints[index]) {
              dataPoints[index] = e1rm;
            }
          }
        });

        const firstValidIndex = dataPoints.findIndex(val => val !== null);
        let idealData: (number | null)[] = [];
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
              borderColor: '#2dd4bf', 
              backgroundColor: 'rgba(45, 212, 191, 0.1)',
              tension: 0.1,
              spanGaps: true,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: '#2dd4bf'
            },
            {
              label: 'Ideal Trend',
              data: idealData,
              borderColor: '#f472b6', 
              backgroundColor: 'rgba(244, 114, 182, 0.1)',
              borderDash: [5, 5],
              pointRadius: 0,
              spanGaps: true
            },
          ],
        });
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchProgress();
  }, [selectedExercise, timeRange, exercises]);

  const RANK_ORDER = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Apex"];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-6 font-medium transition">
          ← Back to Dashboard
        </button>

        <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-800">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Progress Analytics</h1>
              {rank && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium text-slate-400">
                    Current Rank: <span className={`font-bold text-lg ${getRankColor(rank)}`}>{rank}</span>
                  </span>
                  <button onClick={() => setShowRankModal(true)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition">
                    ℹ️ View Distribution
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
               <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))} className="bg-slate-800 border border-slate-700 text-white p-2 rounded focus:ring-2 focus:ring-violet-500 outline-none text-sm">
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
               </select>
               <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="bg-slate-800 border border-slate-700 text-white p-2 rounded focus:ring-2 focus:ring-violet-500 outline-none font-bold">
                {exercises.map(ex => (<option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>))}
               </select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-96 w-full mb-12 flex items-center justify-center">
            {isLoading ? (
              <div className="text-slate-500 animate-pulse">Loading chart data...</div>
            ) : chartData ? (
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: { display: true, text: 'Strength Score', color: '#94a3b8' },
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#cbd5e1' }
                    },
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#cbd5e1' }
                    }
                  },
                  plugins: {
                    legend: { labels: { color: '#cbd5e1' } },
                    title: { color: '#fff' },
                    tooltip: { 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      titleColor: '#fff',
                      bodyColor: '#cbd5e1',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      callbacks: { label: (c) => c.parsed.y ? `Score: ${c.parsed.y.toFixed(1)}` : '' } 
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-center">
                <p className="text-slate-500 mb-4">No logs found for this exercise yet.</p>
                <button onClick={() => navigate('/')} className="text-violet-400 hover:underline font-medium">Go log a workout! →</button>
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-6 border-t border-slate-800">
            <h3 className="font-bold text-slate-400 mb-8 text-sm uppercase tracking-wide text-center">🏆 Rank Standards (Est. 1RM)</h3>
            
            {exercises.find(e => String(e.exercise_id) === selectedExercise)?.name && STRENGTH_STANDARDS[exercises.find(e => String(e.exercise_id) === selectedExercise)!.name] ? (
              
              <div className="flex items-end justify-between gap-2 h-48 px-2">
                {RANK_ORDER.map((rankName, index) => {
                  const exerciseName = exercises.find(e => String(e.exercise_id) === selectedExercise)!.name;
                  // @ts-ignore
                  const weight = STRENGTH_STANDARDS[exerciseName][rankName];
                  const heightPercent = 20 + (index * 16); 
                  
                  return (
                    <div 
                      key={rankName} 
                      className={`w-full rounded-t-xl border-t-4 bg-gradient-to-b from-slate-800 to-transparent flex flex-col items-center justify-start pt-3 transition-all duration-300 hover:bg-slate-800/80 group ${getBorderColor(rankName)}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Rank Name (At the top of the step) */}
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider mb-1 ${getRankColor(rankName)} group-hover:scale-110 transition-transform`}>
                        {rankName}
                      </span>
                      
                      {/* Weight (Just below name) */}
                      <span className="text-xs font-mono text-white font-bold">
                        {weight}<span className="text-[10px] text-slate-500 ml-0.5">kg</span>
                      </span>
                    </div>
                  )
                })}
              </div>

            ) : (
              <p className="text-slate-500 italic text-sm text-center">No official ranked standards for this exercise yet.</p>
            )}
          </div>

        </div>
      </div>

      {/* Modal */}
      {showRankModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-700">
            <button onClick={() => setShowRankModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">✕</button>
            
            <h2 className="text-xl font-bold text-white mb-4">Rank Distribution</h2>
            
            <p className="text-sm text-slate-400 mb-4">
              Standards for <strong>{exercises.find(e => String(e.exercise_id) === selectedExercise)?.name}</strong> (1 Rep Max)
            </p>

            {(() => {
              const ex = exercises.find(e => String(e.exercise_id) === selectedExercise);
              const standards = ex ? STRENGTH_STANDARDS[ex.name] : null;

              return standards ? (
                <div className="space-y-3">
                  {Object.entries(standards).reverse().map(([rankName, weight]) => (
                    <div key={rankName} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0">
                      <div className="flex flex-col">
                        <span className={`font-bold ${getRankColor(rankName)}`}>{rankName}</span>
                        <span className="text-xs text-slate-500">
                            {(RANK_DESCRIPTIONS as any)[rankName]}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-300">{weight} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No official ranked standards for this exercise yet.</p>
              );
            })()}
            
            <div className="mt-6 text-center">
              <button onClick={() => setShowRankModal(false)} className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 font-medium w-full transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;