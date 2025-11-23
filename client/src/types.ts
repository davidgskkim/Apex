export interface User {
  user_id: string;
  username: string;
  email: string;
}

export interface Workout {
  workout_id: number;
  user_id: string;
  name: string;
  workout_date: string;
}

export interface Exercise {
  exercise_id: number;
  name: string;
  category: string;
  user_id?: string;
}

export interface WorkoutLog {
  log_id: number;
  workout_id: number;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
}