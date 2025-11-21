import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import WorkoutPage from './pages/WorkoutPage';
import ProgressPage from './pages/ProgressPage'
import CoachPage from './pages/CoachPage'
import OnboardingPage from './pages/OnboardingPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout/:id" element={<WorkoutPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
      
    </Routes>
  )
}

export default App;